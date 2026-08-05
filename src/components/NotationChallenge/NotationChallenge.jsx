import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Circle,
  Dumbbell,
  Lightbulb,
  PartyPopper,
  Trophy,
  X,
} from 'lucide-react'
import ChessBoard from '../ChessBoard/ChessBoard'
import PerformanceTracker from '../../services/performanceTracker'
import {
  generateChallenge,
  getValidMovesFrom,
  canMoveFrom,
} from '../../services/notationGenerator'
import { announce } from '../../services/announcer'
import './NotationChallenge.css'

const DIFFICULTY_SETTINGS = {
  easy: { time: 15, label: 'Easy (15s)', moveTypes: ['pawn', 'piece'] },
  medium: { time: 10, label: 'Medium (10s)', moveTypes: ['pawn', 'piece', 'capture'] },
  hard: { time: 6, label: 'Hard (6s)', moveTypes: ['pawn', 'piece', 'capture', 'castle', 'check'] },
}

const CHALLENGE_LENGTH = 15 // Number of moves per challenge

const NotationChallenge = ({ onComplete, onBack }) => {
  // Game settings
  const [mode, setMode] = useState(null) // 'practice' or 'challenge'
  const [difficulty, setDifficulty] = useState('medium')
  const [perspective, setPerspective] = useState('white') // 'white', 'black', or 'both'
  const [challengeConfig, setChallengeConfig] = useState(null)

  useEffect(() => {
    fetch('challenge-config.json')
      .then((r) => r.json())
      .then(setChallengeConfig)
      .catch(() => {})
  }, [])

  // Game state
  const [isPlaying, setIsPlaying] = useState(false)
  const [challenge, setChallenge] = useState(null)
  const [currentPerspective, setCurrentPerspective] = useState('white')
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [timeLeft, setTimeLeft] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [showHint, setShowHint] = useState(false)

  // Results
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState(null)

  // Coordinate display
  const [showCoords, setShowCoords] = useState(true)

  // Refs
  const trackerRef = useRef(new PerformanceTracker())
  const timerRef = useRef(null)

  // Generate next challenge
  const nextChallenge = useCallback(() => {
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

    // Generate new challenge for the determined perspective
    const moveTypes = DIFFICULTY_SETTINGS[difficulty].moveTypes
    const newChallenge = generateChallenge(moveTypes, questionPerspective)
    setChallenge(newChallenge)
    setSelectedSquare(null)
    setValidMoves([])
    setFeedback(null)
    setShowHint(false)
    setQuestionNumber((prev) => prev + 1)
    announce(`Play ${newChallenge.san}, ${newChallenge.turn} to move`)

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
              expected: newChallenge.san,
              timedOut: true,
            })
            setFeedback({
              type: 'timeout',
              message: `Time's up! The answer was ${newChallenge.san}`,
              correctFrom: newChallenge.from,
              correctTo: newChallenge.to,
            })
            announce(`Time's up! The answer was ${newChallenge.san}`)
            setTimeout(() => nextChallenge(), 1500)
            return 0
          }
          if (prev === 4) announce('3 seconds left')
          return prev - 1
        })
      }, 1000)
    }
  }, [mode, difficulty, perspective, questionNumber])

  // Handle square click
  const handleSquareClick = useCallback(
    (clickedSquare) => {
      if (!isPlaying || feedback) return

      // If no piece selected, try to select one
      if (!selectedSquare) {
        if (canMoveFrom(challenge.fen, clickedSquare)) {
          setSelectedSquare(clickedSquare)
          const moves = getValidMovesFrom(challenge.fen, clickedSquare)
          setValidMoves(moves)
        }
        return
      }

      // If clicking the same square, deselect
      if (clickedSquare === selectedSquare) {
        setSelectedSquare(null)
        setValidMoves([])
        return
      }

      // If clicking another piece of same color, select it instead
      if (canMoveFrom(challenge.fen, clickedSquare)) {
        setSelectedSquare(clickedSquare)
        const moves = getValidMovesFrom(challenge.fen, clickedSquare)
        setValidMoves(moves)
        return
      }

      // Try to make the move
      const isCorrectFrom = selectedSquare === challenge.from
      const isCorrectTo = clickedSquare === challenge.to
      const isCorrect = isCorrectFrom && isCorrectTo

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Record attempt
      trackerRef.current.recordAttempt(isCorrect, {
        expected: challenge.san,
        from: selectedSquare,
        to: clickedSquare,
      })

      if (isCorrect) {
        setFeedback({
          type: 'correct',
          message: 'Correct!',
        })
        announce('Correct!')
      } else {
        setFeedback({
          type: 'wrong',
          message: `Wrong! The correct move was ${challenge.from} → ${challenge.to}`,
          correctFrom: challenge.from,
          correctTo: challenge.to,
        })
        announce(`Wrong! The correct move was ${challenge.from} to ${challenge.to}`)
      }

      setSelectedSquare(null)
      setValidMoves([])

      // Move to next challenge after delay
      setTimeout(() => {
        nextChallenge()
      }, isCorrect ? 800 : 1500)
    },
    [isPlaying, challenge, selectedSquare, feedback, nextChallenge]
  )

  // Handle hint button
  const handleHint = () => {
    setShowHint(true)
    if (challenge) announce(`Hint: move from ${challenge.from} to ${challenge.to}`)
  }

  // Handle skip button (practice mode only)
  const handleSkip = () => {
    trackerRef.current.recordAttempt(false, {
      expected: challenge.san,
      skipped: true,
    })
    nextChallenge()
  }

  // Start game
  const startGame = useCallback(() => {
    trackerRef.current.reset()
    trackerRef.current.startChallenge()
    setQuestionNumber(0)
    setShowResults(false)
    setResults(null)
    setIsPlaying(true)
    nextChallenge()
  }, [nextChallenge])

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
    setChallenge(null)
    setFeedback(null)
    setSelectedSquare(null)
    setValidMoves([])
    if (mode) announce(mode === 'practice' ? 'Practice mode' : 'Challenge mode')
  }, [mode])

  // Announce results (they only appear visually)
  useEffect(() => {
    if (showResults && results) {
      announce(
        `Challenge complete. ${results.accuracy} percent accuracy, ${results.correct} correct, ${results.incorrect} incorrect. ${results.passed ? 'Passed!' : 'Not passed.'}`
      )
    }
  }, [showResults, results])

  // Mode selection screen
  if (!mode) {
    return (
      <div className="notation-challenge">
        <h2>Chess Notation Challenge</h2>
        <p className="description">
          Read chess notation (like Nf3, Bxe5, O-O) and make the correct move on the board.
          Click the piece first, then click where it should go.
        </p>

        <div className="mode-selection">
          <h3>Select Mode</h3>
          <div className="mode-buttons">
            <button className="mode-button practice" onClick={() => setMode('practice')}>
              <span className="mode-icon"><BookOpen aria-hidden="true" /></span>
              <span className="mode-name">Practice</span>
              <span className="mode-desc">No timer, hints available</span>
            </button>
            <button className="mode-button challenge" onClick={() => setMode('challenge')}>
              <span className="mode-icon"><Trophy aria-hidden="true" /></span>
              <span className="mode-name">Challenge</span>
              <span className="mode-desc">Timed, {CHALLENGE_LENGTH} moves</span>
            </button>
          </div>
        </div>

        <button className="btn btn-ghost back-button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Back to Menu
        </button>
      </div>
    )
  }

  // Settings screen (before starting)
  if (!isPlaying && !showResults) {
    return (
      <div className="notation-challenge">
        <h2>{mode === 'practice' ? 'Practice Mode' : 'Challenge Mode'}</h2>

        <div className="settings">
          <div className="setting-group">
            <label>Difficulty</label>
            <div className="option-buttons">
              {Object.entries(DIFFICULTY_SETTINGS).map(([key, { label }]) => (
                <button
                  key={key}
                  className={`btn btn-secondary option-button ${difficulty === key ? 'selected' : ''}`}
                  aria-pressed={difficulty === key}
                  onClick={() => setDifficulty(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="setting-description">
              {difficulty === 'easy' && 'Basic piece and pawn moves'}
              {difficulty === 'medium' && 'Includes captures'}
              {difficulty === 'hard' && 'Includes castling and checks'}
            </p>
          </div>

          {mode === 'practice' && (
            <div className="setting-group">
              <label>Board Perspective</label>
              <div className="option-buttons">
                <button
                  className={`btn btn-secondary option-button ${perspective === 'white' ? 'selected' : ''}`}
                  aria-pressed={perspective === 'white'}
                  onClick={() => setPerspective('white')}
                >
                  White
                </button>
                <button
                  className={`btn btn-secondary option-button ${perspective === 'black' ? 'selected' : ''}`}
                  aria-pressed={perspective === 'black'}
                  onClick={() => setPerspective('black')}
                >
                  Black
                </button>
                <button
                  className={`btn btn-secondary option-button ${perspective === 'both' ? 'selected' : ''}`}
                  aria-pressed={perspective === 'both'}
                  onClick={() => setPerspective('both')}
                >
                  Both
                </button>
              </div>
            </div>
          )}

          {mode === 'challenge' && (
            <p className="setting-description">
              Perspective will be randomized each move
            </p>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary start-button" onClick={startGame}>
            Start {mode === 'practice' ? 'Practice' : 'Challenge'}
          </button>
          <button className="btn btn-ghost back-button" onClick={() => setMode(null)}>
            <ArrowLeft aria-hidden="true" /> Change Mode
          </button>
        </div>
      </div>
    )
  }

  // Results screen
  if (showResults && results) {
    return (
      <div className="notation-challenge">
        <h2>Challenge Complete!</h2>

        <div className={`results ${results.passed ? 'passed' : 'failed'}`}>
          <div className="result-main">
            <span className="result-icon">
              {results.passed
                ? <PartyPopper aria-hidden="true" />
                : <Dumbbell aria-hidden="true" />}
            </span>
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

          {difficulty === 'hard' && results.accuracy >= 90 && challengeConfig?.notationChallengeCode && (
            <div className="challenge-code">
              <p className="challenge-code-label">Hard mode master! Your unlock code:</p>
              <span className="challenge-code-value">{challengeConfig.notationChallengeCode}</span>
            </div>
          )}

          {difficulty === 'hard' && (
            <div className="challenge-riddle">
              <p className="challenge-riddle-label">A riddle for the hard-mode reader:</p>
              <p className="challenge-riddle-text">
                Still on its starting square, a pawn may stretch its legs before
                it settles into single steps. How many squares forward can that
                very first march carry it?
              </p>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary start-button" onClick={startGame}>
            Try Again
          </button>
          <button className="btn btn-ghost back-button" onClick={() => setMode(null)}>
            <ArrowLeft aria-hidden="true" /> Change Settings
          </button>
        </div>
      </div>
    )
  }

  // Game screen
  return (
    <div className="notation-challenge playing">
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
              <Check className="stat-icon-correct" role="img" aria-label="Correct" />{' '}
              {trackerRef.current.getCorrectCount()} |{' '}
              <X className="stat-icon-wrong" role="img" aria-label="Incorrect" />{' '}
              {trackerRef.current.getIncorrectCount()}
            </span>
          )}
        </div>

        <div className="move-display">
          <span className="move-label">Play:</span>
          <span className="move-notation">{challenge?.san}</span>
        </div>

        <div className="turn-indicator">
          Playing as:{' '}
          <strong>
            <Circle
              className={currentPerspective === 'white' ? 'piece-dot-white' : 'piece-dot-black'}
              aria-hidden="true"
            />{' '}
            {currentPerspective === 'white' ? 'White' : 'Black'}
          </strong>
          {' | '}
          {challenge?.turn === 'white' ? 'White to move' : 'Black to move'}
        </div>

        {showHint && challenge && (
          <div className="hint">
            <Lightbulb aria-hidden="true" /> Move: {challenge.from} → {challenge.to}
          </div>
        )}
      </div>

      <div className="game-board">
        <ChessBoard
          fen={challenge?.fen}
          flipped={currentPerspective === 'black'}
          selectedSquare={selectedSquare}
          highlightedSquares={[
            ...validMoves,
            ...(showHint ? [challenge?.from, challenge?.to] : []),
            ...(feedback?.correctFrom ? [feedback.correctFrom] : []),
          ]}
          correctSquare={feedback?.type === 'correct' ? challenge?.to : null}
          wrongSquare={feedback?.type === 'wrong' ? selectedSquare : null}
          onSquareClick={handleSquareClick}
          showLabels={mode === 'challenge' && difficulty === 'hard' ? false : showCoords}
          draggable
        />
      </div>

      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="game-controls">
        {mode === 'practice' && !feedback && (
          <>
            {!showHint && (
              <button className="btn hint-button" onClick={handleHint}>
                <Lightbulb aria-hidden="true" /> Hint
              </button>
            )}
            <button className="btn btn-secondary skip-button" onClick={handleSkip}>
              Skip <ArrowRight aria-hidden="true" />
            </button>
          </>
        )}

        {mode === 'practice' && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

export default NotationChallenge
