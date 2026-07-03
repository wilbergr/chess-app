import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Circle,
  Dices,
  Dumbbell,
  Lightbulb,
  PartyPopper,
  Trophy,
} from 'lucide-react'
import { Chess } from 'chess.js'
import ChessBoard from '../ChessBoard/ChessBoard'
import PerformanceTracker from '../../services/performanceTracker'
import { getValidMovesFrom, canMoveFrom } from '../../services/notationGenerator'
import {
  getGamesByDifficulty,
  getRandomGame,
  getDifficultyLevels,
} from '../../data/games'
import { announce } from '../../services/announcer'
import './GameChallenge.css'

// "check" / "checkmate" suffix for announcements, derived from SAN
const checkSuffix = (san) =>
  san?.includes('#') ? ', checkmate' : san?.includes('+') ? ', check' : ''

const DIFFICULTY_SETTINGS = {
  beginner: { movesVisible: 3, timePerMove: 15, label: 'Beginner' },
  intermediate: { movesVisible: 2, timePerMove: 10, label: 'Intermediate' },
  advanced: { movesVisible: 1, timePerMove: 6, label: 'Advanced' },
}

const GameChallenge = ({ onBack }) => {
  // Settings state
  const [difficulty, setDifficulty] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [mode, setMode] = useState(null) // 'practice' or 'challenge'
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
  const [chess, setChess] = useState(null)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [currentPerspective, setCurrentPerspective] = useState('white')
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)

  // Results
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState(null)

  // Coordinate display
  const [showCoords, setShowCoords] = useState(true)

  // Auto-play pending: true while the opponent's move is being animated
  const [autoPlayPending, setAutoPlayPending] = useState(false)

  // Refs
  const trackerRef = useRef(new PerformanceTracker())
  const timerRef = useRef(null)
  const advanceMoveRef = useRef(null)

  // Get current settings
  const settings = difficulty ? DIFFICULTY_SETTINGS[difficulty] : null

  // Get current move info
  const currentMove = selectedGame?.moves[currentMoveIndex]
  const isWhiteTurn = currentMoveIndex % 2 === 0
  const moveNumber = Math.floor(currentMoveIndex / 2) + 1

  // Determine which moves to show based on difficulty
  const visibleMoveRange = useMemo(() => {
    if (!settings || !selectedGame) return { start: 0, end: 0 }

    const totalMoves = selectedGame.moves.length

    // Show current move and next N-1 moves
    const start = currentMoveIndex
    const end = Math.min(currentMoveIndex + settings.movesVisible, totalMoves)
    return { start, end }
  }, [settings, selectedGame, currentMoveIndex])

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Start timer for current move
  const startTimer = useCallback(() => {
    clearTimer()

    if (mode !== 'challenge' || !settings?.timePerMove) return

    setTimeLeft(settings.timePerMove)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          // Time's up - count as wrong
          trackerRef.current.recordAttempt(false, {
            move: currentMove,
            timedOut: true,
          })
          setFeedback({
            type: 'timeout',
            message: `Time's up! The move was ${currentMove}`,
          })
          announce(`Time's up! The move was ${currentMove}`)
          setWrongAttempts((prev) => prev + 1)

          // Auto-advance after delay
          setTimeout(() => {
            advanceMoveRef.current?.()
          }, 1500)

          return 0
        }
        if (prev === 6) announce('5 seconds left')
        return prev - 1
      })
    }, 1000)
  }, [mode, settings, currentMove, clearTimer])

  // Advance to next move
  const advanceMove = useCallback(() => {
    if (!selectedGame) return

    const nextIndex = currentMoveIndex + 1

    if (nextIndex >= selectedGame.moves.length) {
      // Game complete!
      setIsPlaying(false)
      setShowResults(true)
      setResults(trackerRef.current.getResults())
      clearTimer()
      return
    }

    // Make the move on our chess instance
    const move = selectedGame.moves[currentMoveIndex]
    const newChess = new Chess(chess.fen())
    try {
      newChess.move(move)
      setChess(newChess)
    } catch (e) {
      console.error('Failed to make move:', move, e)
    }

    setCurrentMoveIndex(nextIndex)
    setSelectedSquare(null)
    setValidMoves([])
    setFeedback(null)

    // Start timer for next move
    if (mode === 'challenge') {
      trackerRef.current.startAttempt()
      startTimer()
    }
  }, [selectedGame, currentMoveIndex, chess, mode, clearTimer, startTimer])

  // Keep ref pointing at the latest advanceMove so timer closures are never stale
  useEffect(() => {
    advanceMoveRef.current = advanceMove
  })

  // Auto-play the opponent's move when perspective is 'white' or 'black' (practice mode only)
  useEffect(() => {
    if (!isPlaying || !chess || !selectedGame || showResults) return
    if (perspective === 'both' || mode === 'challenge') return

    const isWhiteMove = currentMoveIndex % 2 === 0
    const shouldAutoPlay =
      (perspective === 'white' && !isWhiteMove) ||
      (perspective === 'black' && isWhiteMove)

    if (!shouldAutoPlay) return

    setAutoPlayPending(true)
    setSelectedSquare(null)
    setValidMoves([])
    setFeedback(null)

    // Capture values so the timeout closure is never stale
    const capturedChess = chess
    const capturedMoveIndex = currentMoveIndex
    const capturedGame = selectedGame

    const timeout = setTimeout(() => {
      const move = capturedGame.moves[capturedMoveIndex]
      if (!move) {
        setAutoPlayPending(false)
        return
      }

      const newChess = new Chess(capturedChess.fen())
      try {
        newChess.move(move)
      } catch (e) {
        console.error('Failed to auto-play move:', move, e)
        setAutoPlayPending(false)
        return
      }

      setChess(newChess)
      announce(`Opponent played ${move}${checkSuffix(move)}`)

      const nextIndex = capturedMoveIndex + 1
      if (nextIndex >= capturedGame.moves.length) {
        setIsPlaying(false)
        setShowResults(true)
        setResults(trackerRef.current.getResults())
        clearTimer()
      } else {
        setCurrentMoveIndex(nextIndex)
      }

      setAutoPlayPending(false)
    }, 400)

    return () => clearTimeout(timeout)
  }, [currentMoveIndex, isPlaying, chess, selectedGame, perspective, mode, showResults, clearTimer])

  // Handle square click
  const handleSquareClick = useCallback(
    (clickedSquare) => {
      if (!isPlaying || feedback || !chess || autoPlayPending) return

      const fen = chess.fen()

      // If no piece selected, try to select one
      if (!selectedSquare) {
        if (canMoveFrom(fen, clickedSquare)) {
          setSelectedSquare(clickedSquare)
          const moves = getValidMovesFrom(fen, clickedSquare)
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
      if (canMoveFrom(fen, clickedSquare)) {
        setSelectedSquare(clickedSquare)
        const moves = getValidMovesFrom(fen, clickedSquare)
        setValidMoves(moves)
        return
      }

      // Try to make the move
      clearTimer()

      const testChess = new Chess(fen)
      let madeMove = null
      try {
        madeMove = testChess.move({ from: selectedSquare, to: clickedSquare, promotion: 'q' })
      } catch (e) {
        // Invalid move
      }

      if (!madeMove) {
        // Invalid move attempt
        setSelectedSquare(null)
        setValidMoves([])
        return
      }

      // Check if it matches the expected move
      const expectedMove = currentMove
      const isCorrect = madeMove.san === expectedMove

      if (isCorrect) {
        trackerRef.current.recordAttempt(true, { move: expectedMove })
        setFeedback({ type: 'correct', message: 'Correct!' })
        announce(`Correct! ${expectedMove}${checkSuffix(expectedMove)}`)

        setTimeout(() => {
          advanceMove()
        }, 500)
      } else {
        trackerRef.current.recordAttempt(false, {
          move: expectedMove,
          played: madeMove.san,
        })
        setWrongAttempts((prev) => prev + 1)
        setFeedback({
          type: 'wrong',
          message: `Wrong! You played ${madeMove.san}, expected ${expectedMove}`,
        })
        announce(`Wrong! You played ${madeMove.san}, expected ${expectedMove}`)
        setSelectedSquare(null)
        setValidMoves([])

        // In practice mode, let them try again
        // In challenge mode, auto-advance
        if (mode === 'challenge') {
          setTimeout(() => {
            advanceMove()
          }, 1500)
        } else {
          setTimeout(() => {
            setFeedback(null)
            startTimer()
          }, 1500)
        }
      }
    },
    [isPlaying, feedback, chess, selectedSquare, currentMove, mode, clearTimer, advanceMove, startTimer, autoPlayPending]
  )

  // Handle hint button (practice mode)
  const handleHint = () => {
    // Parse the expected move to get from/to squares
    const testChess = new Chess(chess.fen())
    try {
      const move = testChess.move(currentMove)
      if (move) {
        setSelectedSquare(move.from)
        setValidMoves([move.to])
        announce(`Hint: move from ${move.from} to ${move.to}`)
      }
    } catch (e) {
      console.error('Failed to parse hint move:', e)
    }
  }

  // Handle skip (practice mode)
  const handleSkip = () => {
    trackerRef.current.recordAttempt(false, { move: currentMove, skipped: true })
    advanceMove()
  }

  // Start the game
  const startGame = useCallback(() => {
    if (!selectedGame) return

    // Determine perspective for this game
    let gamePerspective
    if (mode === 'challenge') {
      gamePerspective = Math.random() > 0.5 ? 'white' : 'black'
    } else if (perspective === 'both') {
      gamePerspective = Math.random() > 0.5 ? 'white' : 'black'
    } else {
      gamePerspective = perspective
    }
    setCurrentPerspective(gamePerspective)

    const newChess = new Chess()
    setChess(newChess)
    setCurrentMoveIndex(0)
    setSelectedSquare(null)
    setValidMoves([])
    setFeedback(null)
    setWrongAttempts(0)
    setShowResults(false)
    setResults(null)

    trackerRef.current.reset()
    trackerRef.current.startChallenge()
    trackerRef.current.startAttempt()

    setAutoPlayPending(false)
    setIsPlaying(true)

    if (mode === 'challenge' && settings?.timePerMove) {
      startTimer()
    }
  }, [selectedGame, mode, perspective, settings, startTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  // Reset when difficulty or mode changes
  useEffect(() => {
    clearTimer()
    setIsPlaying(false)
    setShowResults(false)
    setSelectedGame(null)
    if (mode) announce(mode === 'practice' ? 'Practice mode' : 'Challenge mode')
  }, [difficulty, mode, clearTimer])

  // Announce results (they only appear visually)
  useEffect(() => {
    if (showResults && results) {
      announce(
        `Game complete. ${results.accuracy} percent accuracy, ${results.correct} correct, ${results.incorrect} wrong. ${results.passed ? 'Passed!' : 'Not passed.'}`
      )
    }
  }, [showResults, results])

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="game-challenge">
        <h2>Full Game Challenge</h2>
        <p className="description">
          Play through complete chess games using algebraic notation.
          Execute each move by clicking the correct piece and destination.
        </p>

        <div className="difficulty-selection">
          <h3>Select Difficulty</h3>
          <div className="difficulty-cards">
            {getDifficultyLevels().map((level) => (
              <button
                key={level.id}
                className={`difficulty-card ${level.id}`}
                onClick={() => setDifficulty(level.id)}
              >
                <span className="difficulty-label">{level.label}</span>
                <span className="difficulty-desc">{level.description}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-ghost back-button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Back to Menu
        </button>
      </div>
    )
  }

  // Mode selection screen
  if (!mode) {
    return (
      <div className="game-challenge">
        <h2>{DIFFICULTY_SETTINGS[difficulty].label} Games</h2>

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
              <span className="mode-desc">{settings.timePerMove}s per move</span>
            </button>
          </div>
        </div>

        <button className="btn btn-ghost back-button" onClick={() => setDifficulty(null)}>
          <ArrowLeft aria-hidden="true" /> Change Difficulty
        </button>
      </div>
    )
  }

  // Game selection screen
  if (!selectedGame) {
    const games = getGamesByDifficulty(difficulty)

    return (
      <div className="game-challenge">
        <h2>Select a Game</h2>
        <p className="description">{mode === 'practice' ? 'Practice Mode' : 'Challenge Mode'}</p>

        <div className="game-list">
          <button
            className="game-card random"
            onClick={() => setSelectedGame(getRandomGame(difficulty))}
          >
            <span className="game-icon"><Dices aria-hidden="true" /></span>
            <span className="game-title">Random Game</span>
            <span className="game-desc">Surprise me!</span>
          </button>

          {games.map((game) => (
            <button
              key={game.id}
              className="game-card"
              onClick={() => setSelectedGame(game)}
            >
              <span className="game-title">{game.title}</span>
              <span className="game-desc">{game.description}</span>
              <span className="game-moves">{game.moves.length} moves</span>
            </button>
          ))}
        </div>

        <button className="btn btn-ghost back-button" onClick={() => setMode(null)}>
          <ArrowLeft aria-hidden="true" /> Change Mode
        </button>
      </div>
    )
  }

  // Results screen
  if (showResults && results) {
    const totalMoves = selectedGame.moves.length

    return (
      <div className="game-challenge">
        <h2>Game Complete!</h2>
        <h3 className="game-title-result">{selectedGame.title}</h3>

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
              <span className="stat-label">Wrong</span>
            </div>
            <div className="stat">
              <span className="stat-value">{totalMoves}</span>
              <span className="stat-label">Total Moves</span>
            </div>
            <div className="stat">
              <span className="stat-value">{(results.totalTime / 1000).toFixed(0)}s</span>
              <span className="stat-label">Total Time</span>
            </div>
          </div>

          <div className="result-message">
            {results.accuracy === 100
              ? 'Perfect! You played every move correctly!'
              : results.passed
              ? 'Great job! You completed the game!'
              : 'Keep practicing! Try to get 75% accuracy.'}
          </div>

          {difficulty === 'advanced' && results.accuracy >= 90 && challengeConfig?.gameChallengeCode && (
            <div className="challenge-code">
              <p className="challenge-code-label">Advanced mode master! Your unlock code:</p>
              <span className="challenge-code-value">{challengeConfig.gameChallengeCode}</span>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary start-button" onClick={startGame}>
            Play Again
          </button>
          <button className="btn btn-ghost back-button" onClick={() => setSelectedGame(null)}>
            Choose Different Game
          </button>
          <button className="btn btn-ghost back-button" onClick={() => setMode(null)}>
            Change Mode
          </button>
        </div>
      </div>
    )
  }

  // Pre-game screen
  if (!isPlaying) {
    return (
      <div className="game-challenge">
        <h2>{selectedGame.title}</h2>
        <p className="game-description">{selectedGame.description}</p>
        <p className="game-info">
          {selectedGame.moves.length} moves | {mode === 'practice' ? 'Practice' : 'Challenge'} Mode
        </p>

        {mode === 'practice' && (
          <div className="setting-group">
            <label>Play as</label>
            <div className="perspective-options">
              <button
                className={`btn btn-secondary perspective-option ${perspective === 'white' ? 'selected' : ''}`}
                aria-pressed={perspective === 'white'}
                onClick={() => setPerspective('white')}
              >
                White
              </button>
              <button
                className={`btn btn-secondary perspective-option ${perspective === 'black' ? 'selected' : ''}`}
                aria-pressed={perspective === 'black'}
                onClick={() => setPerspective('black')}
              >
                Black
              </button>
              <button
                className={`btn btn-secondary perspective-option ${perspective === 'both' ? 'selected' : ''}`}
                aria-pressed={perspective === 'both'}
                onClick={() => setPerspective('both')}
              >
                Both
              </button>
            </div>
            {perspective !== 'both' && (
              <p className="perspective-hint">
                You play {perspective === 'white' ? 'White' : 'Black'} — the opponent moves automatically
              </p>
            )}
          </div>
        )}

        {mode === 'challenge' && (
          <p className="challenge-note">Board perspective will be randomized</p>
        )}

        <div className="action-buttons">
          <button className="btn btn-primary start-button" onClick={startGame}>
            Start Game
          </button>
          <button className="btn btn-ghost back-button" onClick={() => setSelectedGame(null)}>
            <ArrowLeft aria-hidden="true" /> Choose Different Game
          </button>
        </div>
      </div>
    )
  }

  // Main game screen
  return (
    <div className="game-challenge playing">
      <div className="game-header">
        <div className="game-info-bar">
          <span className="game-title-small">{selectedGame.title}</span>
          <span className="progress">
            Move {currentMoveIndex + 1} of {selectedGame.moves.length}
          </span>
          {mode === 'challenge' && timeLeft !== null && (
            <span className={`timer ${timeLeft <= 5 ? 'warning' : ''}`}>
              {timeLeft}s
            </span>
          )}
        </div>

        <div className="perspective-indicator">
          {autoPlayPending
            ? <span className="auto-play-indicator">Opponent is moving...</span>
            : (
              <>
                Playing as:{' '}
                <strong>
                  <Circle
                    className={currentPerspective === 'white' ? 'piece-dot-white' : 'piece-dot-black'}
                    aria-hidden="true"
                  />{' '}
                  {currentPerspective === 'white' ? 'White' : 'Black'}
                </strong>
              </>
            )
          }
        </div>

        <div className="notation-display">
          <div className="move-indicator">
            <Circle
              className={isWhiteTurn ? 'piece-dot-white' : 'piece-dot-black'}
              aria-hidden="true"
            />{' '}
            {moveNumber}. {!isWhiteTurn && '...'}
          </div>

          <div className="moves-to-play">
            <div className="limited-notation">
              {selectedGame.moves
                .slice(visibleMoveRange.start, visibleMoveRange.end)
                .map((move, idx) => {
                  const actualIdx = visibleMoveRange.start + idx
                  const isActive = actualIdx === currentMoveIndex
                  const moveNum = Math.floor(actualIdx / 2) + 1
                  const isWhite = actualIdx % 2 === 0

                  return (
                    <span key={actualIdx} className={`upcoming-move ${isActive ? 'active' : ''}`}>
                      {isWhite && <span className="move-number">{moveNum}.</span>}
                      {!isWhite && idx === 0 && <span className="move-number">{moveNum}...</span>}
                      <span className="move">{move}</span>
                    </span>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="game-board-container">
        <ChessBoard
          fen={chess?.fen()}
          flipped={currentPerspective === 'black'}
          selectedSquare={selectedSquare}
          highlightedSquares={validMoves}
          onSquareClick={handleSquareClick}
          showLabels={mode === 'challenge' && difficulty === 'advanced' ? false : showCoords}
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
            <button className="btn hint-button" onClick={handleHint}>
              <Lightbulb aria-hidden="true" /> Hint
            </button>
            <button className="btn btn-secondary skip-button" onClick={handleSkip}>
              Skip <ArrowRight aria-hidden="true" />
            </button>
          </>
        )}

        {mode === 'practice' && (
          <label className="coords-toggle">
            <input
              type="checkbox"
              checked={showCoords}
              onChange={(e) => setShowCoords(e.target.checked)}
            />
            Show coordinates
          </label>
        )}

        <button className="btn btn-danger quit-button" onClick={() => {
          clearTimer()
          setIsPlaying(false)
          setShowResults(true)
          setResults(trackerRef.current.getResults())
        }}>
          End Game
        </button>
      </div>
    </div>
  )
}

export default GameChallenge
