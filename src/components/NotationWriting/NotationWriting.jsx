import { useState, useEffect, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import ChessBoard from '../ChessBoard/ChessBoard'
import PerformanceTracker from '../../services/performanceTracker'
import './NotationWriting.css'

// Positions for generating moves at different difficulty levels
const PRACTICE_POSITIONS = [
  // === WHITE TO MOVE ===
  { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', desc: 'Starting position' },
  { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', desc: 'Open game' },
  { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', desc: 'Development' },
  { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', desc: 'Italian setup' },
  { fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 5', desc: 'Castling available' },
  { fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 8 6', desc: 'Both castled' },
  { fen: 'r2qkb1r/ppp2ppp/2np1n2/4p1B1/2B1P1b1/3P1N2/PPP2PPP/RN1QK2R w KQkq - 0 6', desc: 'Complex middle' },
  { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', desc: 'With check' },
  { fen: '4k3/8/8/8/8/8/4P3/4K2R w K - 0 1', desc: 'Endgame white' },

  // === BLACK TO MOVE ===
  { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', desc: 'After 1.e4' },
  { fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1', desc: 'After 1.d4' },
  { fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1', desc: 'After 1.Nf3' },
  { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', desc: 'Black develops' },
  { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq d3 0 4', desc: 'Black captures' },
  { fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 5', desc: 'Black castles' },
  { fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 b - - 0 7', desc: 'Middle game black' },
  { fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4', desc: 'Black responds to check' },
  { fen: '4k3/4p3/8/8/8/8/8/4K3 b - - 0 1', desc: 'Endgame black' },
  { fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', desc: 'Sicilian black' },
]

const DIFFICULTY_SETTINGS = {
  beginner: {
    label: 'Beginner',
    description: 'Pawn moves only (e4, d5, exd5)',
    filter: (move) => move.piece === 'p',
    timePerMove: null,
    hints: true,
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Piece moves (Nf3, Bc4, Qd1)',
    filter: (move) => move.piece !== 'p' && !move.flags.includes('k') && !move.flags.includes('q'),
    timePerMove: 15,
    hints: true,
  },
  advanced: {
    label: 'Advanced',
    description: 'All moves including captures & castling',
    filter: () => true,
    timePerMove: 10,
    hints: false,
  },
}

const CHALLENGE_LENGTH = 20

const NotationWriting = ({ onBack }) => {
  // Settings
  const [mode, setMode] = useState(null)
  const [difficulty, setDifficulty] = useState('beginner')
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
  const [currentPosition, setCurrentPosition] = useState(null)
  const [currentMove, setCurrentMove] = useState(null)
  const [currentPerspective, setCurrentPerspective] = useState('white')
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [showHint, setShowHint] = useState(false)

  // Results
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState(null)

  // Refs
  const trackerRef = useRef(new PerformanceTracker())
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  const settings = DIFFICULTY_SETTINGS[difficulty]

  // Generate a new challenge for a specific color
  const generateNewChallenge = useCallback((color = null) => {
    // Filter positions by color if specified
    const eligiblePositions = color
      ? PRACTICE_POSITIONS.filter((pos) => {
          const chess = new Chess(pos.fen)
          const turn = chess.turn() === 'w' ? 'white' : 'black'
          return turn === color
        })
      : PRACTICE_POSITIONS

    if (eligiblePositions.length === 0) {
      // Fallback to all positions if no match
      return generateNewChallenge(null)
    }

    const position = eligiblePositions[Math.floor(Math.random() * eligiblePositions.length)]
    const chess = new Chess(position.fen)
    const allMoves = chess.moves({ verbose: true })

    // Filter moves based on difficulty
    let validMoves = allMoves.filter(settings.filter)

    // If no valid moves for this filter, try any move
    if (validMoves.length === 0) {
      validMoves = allMoves
    }

    if (validMoves.length === 0) {
      // Position has no legal moves, try another
      return generateNewChallenge(color)
    }

    const move = validMoves[Math.floor(Math.random() * validMoves.length)]

    return {
      fen: position.fen,
      move: move,
      san: move.san,
      from: move.from,
      to: move.to,
      piece: move.piece,
      turn: chess.turn() === 'w' ? 'white' : 'black',
    }
  }, [settings])

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Next question
  const nextQuestion = useCallback(() => {
    clearTimer()

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
      questionPerspective = Math.random() > 0.5 ? 'white' : 'black'
    } else if (perspective === 'both') {
      questionPerspective = Math.random() > 0.5 ? 'white' : 'black'
    } else {
      questionPerspective = perspective
    }
    setCurrentPerspective(questionPerspective)

    const challenge = generateNewChallenge(questionPerspective)
    setCurrentPosition(challenge.fen)
    setCurrentMove(challenge)
    setUserInput('')
    setFeedback(null)
    setShowHint(false)
    setQuestionNumber((prev) => prev + 1)

    trackerRef.current.startAttempt()

    // Focus input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    // Start timer for challenge mode
    if (mode === 'challenge' && settings.timePerMove) {
      setTimeLeft(settings.timePerMove)

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer()
            trackerRef.current.recordAttempt(false, {
              expected: challenge.san,
              entered: '',
              timedOut: true,
            })
            setFeedback({
              type: 'timeout',
              message: `Time's up! The answer was: ${challenge.san}`,
            })
            setTimeout(() => nextQuestion(), 1500)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [mode, difficulty, perspective, questionNumber, settings, generateNewChallenge, clearTimer])

  // Handle submit
  const handleSubmit = useCallback((e) => {
    e?.preventDefault()

    if (!isPlaying || feedback || !currentMove) return

    const trimmedInput = userInput.trim()

    // Normalize input (handle common variations)
    const normalizedInput = trimmedInput
      .replace(/0-0-0/gi, 'O-O-O')
      .replace(/0-0/gi, 'O-O')
      .replace(/o-o-o/gi, 'O-O-O')
      .replace(/o-o/gi, 'O-O')

    const expectedSan = currentMove.san

    // Check if correct (case-insensitive for pieces, exact for squares)
    const isCorrect = normalizedInput === expectedSan ||
                      normalizedInput.toLowerCase() === expectedSan.toLowerCase()

    clearTimer()

    trackerRef.current.recordAttempt(isCorrect, {
      expected: expectedSan,
      entered: trimmedInput,
    })

    if (isCorrect) {
      setFeedback({ type: 'correct', message: 'Correct!' })
      setTimeout(() => nextQuestion(), 600)
    } else {
      setFeedback({
        type: 'wrong',
        message: `Wrong! The correct notation is: ${expectedSan}`,
      })

      if (mode === 'challenge') {
        setTimeout(() => nextQuestion(), 1500)
      } else {
        // Practice mode - let them try again or skip
        setTimeout(() => {
          setFeedback(null)
          setUserInput('')
          inputRef.current?.focus()
        }, 2000)
      }
    }
  }, [isPlaying, feedback, currentMove, userInput, mode, clearTimer, nextQuestion])

  // Handle hint
  const handleHint = () => {
    if (!currentMove) return
    setShowHint(true)
    // Show first character(s) as hint
    const hint = currentMove.san.slice(0, Math.ceil(currentMove.san.length / 2))
    setUserInput(hint)
    inputRef.current?.focus()
  }

  // Handle skip
  const handleSkip = () => {
    trackerRef.current.recordAttempt(false, {
      expected: currentMove?.san,
      skipped: true,
    })
    nextQuestion()
  }

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

  // Cleanup
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  // Reset on mode/difficulty change
  useEffect(() => {
    clearTimer()
    setIsPlaying(false)
    setShowResults(false)
    setQuestionNumber(0)
  }, [mode, difficulty, clearTimer])

  // Mode selection
  if (!mode) {
    return (
      <div className="notation-writing">
        <h2>Write the Notation</h2>
        <p className="description">
          See a move highlighted on the board and type the correct algebraic notation.
          Learn to write moves like "Nf3", "Bxe5", "O-O", and "Qh5+".
        </p>

        <div className="mode-selection">
          <h3>Select Mode</h3>
          <div className="mode-buttons">
            <button className="mode-button practice" onClick={() => setMode('practice')}>
              <span className="mode-icon">📝</span>
              <span className="mode-name">Practice</span>
              <span className="mode-desc">No timer, hints available</span>
            </button>
            <button className="mode-button challenge" onClick={() => setMode('challenge')}>
              <span className="mode-icon">🏆</span>
              <span className="mode-name">Challenge</span>
              <span className="mode-desc">Timed, {CHALLENGE_LENGTH} moves</span>
            </button>
          </div>
        </div>

        <button className="back-button" onClick={onBack}>
          ← Back to Menu
        </button>
      </div>
    )
  }

  // Settings screen
  if (!isPlaying && !showResults) {
    return (
      <div className="notation-writing">
        <h2>{mode === 'practice' ? 'Practice Mode' : 'Challenge Mode'}</h2>

        <div className="settings">
          <div className="setting-group">
            <label>Difficulty</label>
            <div className="difficulty-options">
              {Object.entries(DIFFICULTY_SETTINGS).map(([key, value]) => (
                <button
                  key={key}
                  className={`difficulty-option ${difficulty === key ? 'selected' : ''}`}
                  onClick={() => setDifficulty(key)}
                >
                  <span className="diff-label">{value.label}</span>
                  <span className="diff-desc">{value.description}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === 'practice' && (
            <div className="setting-group">
              <label>Board Perspective</label>
              <div className="perspective-options">
                <button
                  className={`perspective-option ${perspective === 'white' ? 'selected' : ''}`}
                  onClick={() => setPerspective('white')}
                >
                  White
                </button>
                <button
                  className={`perspective-option ${perspective === 'black' ? 'selected' : ''}`}
                  onClick={() => setPerspective('black')}
                >
                  Black
                </button>
                <button
                  className={`perspective-option ${perspective === 'both' ? 'selected' : ''}`}
                  onClick={() => setPerspective('both')}
                >
                  Both
                </button>
              </div>
            </div>
          )}

          {mode === 'challenge' && (
            <p className="challenge-note">Perspective will be randomized each move</p>
          )}
        </div>

        <div className="notation-help">
          <h4>Notation Quick Reference</h4>
          <div className="notation-examples">
            <div className="example">
              <span className="notation">e4</span>
              <span className="meaning">Pawn to e4</span>
            </div>
            <div className="example">
              <span className="notation">Nf3</span>
              <span className="meaning">Knight to f3</span>
            </div>
            <div className="example">
              <span className="notation">Bxe5</span>
              <span className="meaning">Bishop captures on e5</span>
            </div>
            <div className="example">
              <span className="notation">O-O</span>
              <span className="meaning">Kingside castle</span>
            </div>
            <div className="example">
              <span className="notation">O-O-O</span>
              <span className="meaning">Queenside castle</span>
            </div>
            <div className="example">
              <span className="notation">Qh5+</span>
              <span className="meaning">Queen to h5 with check</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="start-button" onClick={startGame}>
            Start {mode === 'practice' ? 'Practice' : 'Challenge'}
          </button>
          <button className="back-button" onClick={() => setMode(null)}>
            ← Change Mode
          </button>
        </div>
      </div>
    )
  }

  // Results screen
  if (showResults && results) {
    return (
      <div className="notation-writing">
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
              <span className="stat-label">Wrong</span>
            </div>
            <div className="stat">
              <span className="stat-value">{(results.averageTime / 1000).toFixed(1)}s</span>
              <span className="stat-label">Avg Time</span>
            </div>
            <div className="stat">
              <span className="stat-value">{(results.bestTime / 1000).toFixed(1)}s</span>
              <span className="stat-label">Best</span>
            </div>
          </div>

          <div className="result-message">
            {results.passed
              ? 'Great job! You know your notation!'
              : 'Keep practicing! You need 75% to pass.'}
          </div>

          {difficulty === 'advanced' && results.accuracy >= 90 && challengeConfig?.notationWritingCode && (
            <div className="challenge-code">
              <p className="challenge-code-label">Advanced mode master! Your unlock code:</p>
              <span className="challenge-code-value">{challengeConfig.notationWritingCode}</span>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="start-button" onClick={startGame}>
            Try Again
          </button>
          <button className="back-button" onClick={() => setMode(null)}>
            ← Change Settings
          </button>
        </div>
      </div>
    )
  }

  // Game screen
  return (
    <div className="notation-writing playing">
      <div className="game-header">
        <div className="game-info">
          {mode === 'challenge' && (
            <>
              <span className="question-count">
                {questionNumber} / {CHALLENGE_LENGTH}
              </span>
              {timeLeft !== null && (
                <span className={`timer ${timeLeft <= 3 ? 'warning' : ''}`}>
                  {timeLeft}s
                </span>
              )}
            </>
          )}
          {mode === 'practice' && (
            <span className="practice-stats">
              ✓ {trackerRef.current.getCorrectCount()} | ✗ {trackerRef.current.getIncorrectCount()}
            </span>
          )}
        </div>

        <div className="prompt">
          <span className="prompt-text">
            Write the notation for the highlighted move:
          </span>
        </div>

        <div className="perspective-indicator">
          Playing as: <strong>{currentPerspective === 'white' ? '⚪ White' : '⚫ Black'}</strong>
        </div>
      </div>

      <div className="game-board">
        <ChessBoard
          fen={currentPosition}
          flipped={currentPerspective === 'black'}
          highlightedSquares={[currentMove?.from, currentMove?.to].filter(Boolean)}
          selectedSquare={currentMove?.from}
        />
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type notation (e.g., Nf3)"
          className={`notation-input ${feedback?.type || ''}`}
          disabled={!!feedback}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <button type="submit" className="submit-button" disabled={!!feedback || !userInput.trim()}>
          Submit
        </button>
      </form>

      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="game-controls">
        {mode === 'practice' && !feedback && (
          <>
            {settings.hints && (
              <button className="hint-button" onClick={handleHint}>
                💡 Hint
              </button>
            )}
            <button className="skip-button" onClick={handleSkip}>
              Skip →
            </button>
          </>
        )}

        <button className="stop-button" onClick={() => setMode(null)}>
          End {mode === 'practice' ? 'Practice' : 'Challenge'}
        </button>
      </div>

      <div className="keyboard-shortcuts">
        <span>Press <kbd>Enter</kbd> to submit</span>
      </div>
    </div>
  )
}

export default NotationWriting
