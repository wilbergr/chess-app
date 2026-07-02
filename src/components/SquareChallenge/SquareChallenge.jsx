import { useState, useEffect, useCallback, useRef } from 'react'
import ChessBoard from '../ChessBoard/ChessBoard'
import PerformanceTracker from '../../services/performanceTracker'
import './SquareChallenge.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8']

const DIFFICULTY_SETTINGS = {
  easy: { time: 10, label: 'Easy (10s)' },
  medium: { time: 5, label: 'Medium (5s)' },
  hard: { time: 3, label: 'Hard (3s)' },
}

const CHALLENGE_LENGTH = 20 // Number of squares per challenge

const generateRandomSquare = () => {
  const file = FILES[Math.floor(Math.random() * 8)]
  const rank = RANKS[Math.floor(Math.random() * 8)]
  return file + rank
}

const SquareChallenge = ({ onComplete, onBack }) => {
  // Game settings
  const [mode, setMode] = useState(null) // 'practice' or 'challenge'
  const [difficulty, setDifficulty] = useState('medium')
  const [challengeConfig, setChallengeConfig] = useState(null)

  useEffect(() => {
    fetch('challenge-config.json')
      .then((r) => r.json())
      .then(setChallengeConfig)
      .catch(() => {})
  }, [])
  const [perspective, setPerspective] = useState('white') // 'white', 'black', or 'both'

  // Game state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSquare, setCurrentSquare] = useState(null)
  const [currentPerspective, setCurrentPerspective] = useState('white')
  const [timeLeft, setTimeLeft] = useState(null)
  const [feedback, setFeedback] = useState(null) // { type: 'correct' | 'wrong', square }
  const [questionNumber, setQuestionNumber] = useState(0)

  // Results
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState(null)

  // Coordinate display
  const [showCoords, setShowCoords] = useState(true)

  // Refs
  const trackerRef = useRef(new PerformanceTracker())
  const timerRef = useRef(null)

  // Generate next question
  const nextQuestion = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Check if challenge is complete
    if (mode === 'challenge' && questionNumber >= CHALLENGE_LENGTH) {
      setIsPlaying(false)
      setShowResults(true)
      setResults(trackerRef.current.getResults())
      return
    }

    // Generate new square
    const newSquare = generateRandomSquare()
    setCurrentSquare(newSquare)
    setFeedback(null)
    setQuestionNumber((prev) => prev + 1)

    // Determine perspective for this question
    let questionPerspective
    if (mode === 'challenge') {
      // Random for challenge mode
      questionPerspective = Math.random() > 0.5 ? 'white' : 'black'
    } else if (perspective === 'both') {
      questionPerspective = Math.random() > 0.5 ? 'white' : 'black'
    } else {
      questionPerspective = perspective
    }
    setCurrentPerspective(questionPerspective)

    // Start attempt timer
    trackerRef.current.startAttempt()

    // Start countdown for challenge mode
    if (mode === 'challenge') {
      const timeLimit = DIFFICULTY_SETTINGS[difficulty].time
      setTimeLeft(timeLimit)

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            // Time's up - record as wrong
            trackerRef.current.recordAttempt(false, {
              expected: newSquare,
              clicked: null,
              timedOut: true,
            })
            setFeedback({ type: 'timeout', square: newSquare })
            setTimeout(() => nextQuestion(), 1000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [mode, difficulty, perspective, questionNumber])

  // Handle square click
  const handleSquareClick = useCallback(
    (clickedSquare) => {
      if (!isPlaying || feedback) return

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      const isCorrect = clickedSquare === currentSquare

      // Record attempt
      trackerRef.current.recordAttempt(isCorrect, {
        expected: currentSquare,
        clicked: clickedSquare,
      })

      // Show feedback
      setFeedback({
        type: isCorrect ? 'correct' : 'wrong',
        square: clickedSquare,
        correctSquare: currentSquare,
      })

      // Move to next question after delay
      setTimeout(() => {
        if (mode === 'practice') {
          nextQuestion()
        } else {
          nextQuestion()
        }
      }, isCorrect ? 500 : 1000)
    },
    [isPlaying, currentSquare, feedback, mode, nextQuestion]
  )

  // Start game
  const startGame = useCallback(() => {
    trackerRef.current.reset()
    trackerRef.current.startChallenge()
    setQuestionNumber(0)
    setShowResults(false)
    setResults(null)
    setIsPlaying(true)
    nextQuestion()
  }, [nextQuestion])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Reset when mode changes
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setShowResults(false)
    setResults(null)
    setQuestionNumber(0)
    setCurrentSquare(null)
    setFeedback(null)
  }, [mode])

  // Mode selection screen
  if (!mode) {
    return (
      <div className="square-challenge">
        <h2>Square Locator Challenge</h2>
        <p className="description">
          Test your knowledge of chess coordinates! Click the correct square when shown a coordinate like "e4" or "h7".
        </p>

        <div className="mode-selection">
          <h3>Select Mode</h3>
          <div className="mode-buttons">
            <button className="mode-button practice" onClick={() => setMode('practice')}>
              <span className="mode-icon">📚</span>
              <span className="mode-name">Practice</span>
              <span className="mode-desc">No timer, unlimited practice</span>
            </button>
            <button className="mode-button challenge" onClick={() => setMode('challenge')}>
              <span className="mode-icon">🏆</span>
              <span className="mode-name">Challenge</span>
              <span className="mode-desc">Timed, {CHALLENGE_LENGTH} squares</span>
            </button>
          </div>
        </div>

        <button className="btn btn-ghost back-button" onClick={onBack}>
          ← Back to Menu
        </button>
      </div>
    )
  }

  // Settings screen (before starting)
  if (!isPlaying && !showResults) {
    return (
      <div className="square-challenge">
        <h2>{mode === 'practice' ? 'Practice Mode' : 'Challenge Mode'}</h2>

        <div className="settings">
          {mode === 'challenge' && (
            <div className="setting-group">
              <label>Difficulty</label>
              <div className="option-buttons">
                {Object.entries(DIFFICULTY_SETTINGS).map(([key, { label }]) => (
                  <button
                    key={key}
                    className={`btn btn-secondary option-button ${difficulty === key ? 'selected' : ''}`}
                    onClick={() => setDifficulty(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'practice' && (
            <div className="setting-group">
              <label>Board Perspective</label>
              <div className="option-buttons">
                <button
                  className={`btn btn-secondary option-button ${perspective === 'white' ? 'selected' : ''}`}
                  onClick={() => setPerspective('white')}
                >
                  White
                </button>
                <button
                  className={`btn btn-secondary option-button ${perspective === 'black' ? 'selected' : ''}`}
                  onClick={() => setPerspective('black')}
                >
                  Black
                </button>
                <button
                  className={`btn btn-secondary option-button ${perspective === 'both' ? 'selected' : ''}`}
                  onClick={() => setPerspective('both')}
                >
                  Both
                </button>
              </div>
            </div>
          )}

          {mode === 'challenge' && (
            <p className="challenge-note">Board perspective will be randomized each question</p>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary start-button" onClick={startGame}>
            Start {mode === 'practice' ? 'Practice' : 'Challenge'}
          </button>
          <button className="btn btn-ghost back-button" onClick={() => setMode(null)}>
            ← Change Mode
          </button>
        </div>
      </div>
    )
  }

  // Results screen
  if (showResults && results) {
    return (
      <div className="square-challenge">
        <h2>Challenge Complete!</h2>

        <div className={`results ${results.passed ? 'passed' : 'failed'}`}>
          <div className="result-main">
            <span className="result-icon">{results.passed ? '🎉' : '💪'}</span>
            <span className="result-accuracy">{results.accuracy}%</span>
            <span className="result-label">Accuracy</span>
          </div>

          <div className="result-stats">
            <div className="stat">
              <span className="stat-value">{results.correct}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat">
              <span className="stat-value">{results.incorrect}</span>
              <span className="stat-label">Incorrect</span>
            </div>
            <div className="stat">
              <span className="stat-value">{(results.averageTime / 1000).toFixed(1)}s</span>
              <span className="stat-label">Avg Time</span>
            </div>
            <div className="stat">
              <span className="stat-value">{(results.bestTime / 1000).toFixed(1)}s</span>
              <span className="stat-label">Best Time</span>
            </div>
          </div>

          <div className="result-message">
            {results.passed
              ? 'Great job! You passed the challenge!'
              : 'Keep practicing! You need 75% to pass.'}
          </div>

          {difficulty === 'hard' && results.accuracy >= 90 && challengeConfig?.squareChallengeCode && (
            <div className="challenge-code">
              <p className="challenge-code-label">Hard mode master! Your unlock code:</p>
              <span className="challenge-code-value">{challengeConfig.squareChallengeCode}</span>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary start-button" onClick={startGame}>
            Try Again
          </button>
          <button className="btn btn-ghost back-button" onClick={() => setMode(null)}>
            ← Change Settings
          </button>
        </div>
      </div>
    )
  }

  // Game screen
  return (
    <div className="square-challenge playing">
      <div className="game-header">
        <div className="game-info">
          {mode === 'challenge' && (
            <>
              <span className="question-count">
                {questionNumber} / {CHALLENGE_LENGTH}
              </span>
              <span className={`timer ${timeLeft <= 3 ? 'warning' : ''}`}>
                {timeLeft}s
              </span>
            </>
          )}
          {mode === 'practice' && (
            <span className="practice-stats">
              ✓ {trackerRef.current.getCorrectCount()} | ✗ {trackerRef.current.getIncorrectCount()}
            </span>
          )}
        </div>

        <div className="target-square">
          <span className="target-label">Find:</span>
          <span className="target-value">{currentSquare?.toUpperCase()}</span>
        </div>

        <div className="perspective-indicator">
          Playing as: <strong>{currentPerspective === 'white' ? 'White' : 'Black'}</strong>
        </div>
      </div>

      <div className="game-board">
        <ChessBoard
          fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" // Starting position
          flipped={currentPerspective === 'black'}
          correctSquare={feedback?.type === 'correct' ? feedback.square : null}
          wrongSquare={feedback?.type === 'wrong' ? feedback.square : null}
          highlightedSquares={
            feedback?.type === 'wrong' || feedback?.type === 'timeout'
              ? [feedback.correctSquare]
              : []
          }
          onSquareClick={handleSquareClick}
          showLabels={mode === 'challenge' && difficulty === 'hard' ? false : showCoords}
        />
      </div>

      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.type === 'correct' && '✓ Correct!'}
          {feedback.type === 'wrong' && `✗ Wrong! It was ${feedback.correctSquare?.toUpperCase()}`}
          {feedback.type === 'timeout' && `⏱ Time's up! It was ${feedback.square?.toUpperCase()}`}
        </div>
      )}

      {mode === 'practice' && (
        <div className="practice-controls">
          <label className="coords-toggle">
            <input
              type="checkbox"
              checked={showCoords}
              onChange={(e) => setShowCoords(e.target.checked)}
            />
            Show coordinates
          </label>
          <button className="btn btn-danger stop-button" onClick={() => setMode(null)}>
            End Practice
          </button>
        </div>
      )}
    </div>
  )
}

export default SquareChallenge
