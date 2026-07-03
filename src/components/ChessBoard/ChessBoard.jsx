import { useMemo, useRef, useState } from 'react'
import Square from './Square'
import './ChessBoard.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

// Parse FEN string to get piece positions
const parseFEN = (fen) => {
  if (!fen) return {}

  const pieces = {}
  const [position] = fen.split(' ')
  const rows = position.split('/')

  rows.forEach((row, rankIndex) => {
    let fileIndex = 0
    for (const char of row) {
      if (/\d/.test(char)) {
        fileIndex += parseInt(char)
      } else {
        const square = FILES[fileIndex] + RANKS[rankIndex]
        pieces[square] = char
        fileIndex++
      }
    }
  })

  return pieces
}

const ChessBoard = ({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  flipped = false,
  highlightedSquares = [],
  selectedSquare = null,
  correctSquare = null,
  wrongSquare = null,
  showCoordinates = false,
  showLabels = true,
  onSquareClick = () => {},
  // false renders a display-only board: squares are plain divs, not buttons
  // (used where clicking has no effect, e.g. Write Notation).
  interactive = true,
}) => {
  const pieces = useMemo(() => parseFEN(fen), [fen])

  // Roving tabindex: one square carries tabIndex=0, arrow keys move focus
  // around the board (matching the visual orientation, so ArrowUp always
  // moves toward the top of the screen even when flipped).
  const boardRef = useRef(null)
  const [focusSquare, setFocusSquare] = useState(null)
  const focusStop = focusSquare ?? (flipped ? 'h8' : 'a1') // bottom-left visually

  const handleKeyNav = (from, key) => {
    let df = { ArrowLeft: -1, ArrowRight: 1 }[key] ?? 0
    let dr = { ArrowDown: -1, ArrowUp: 1 }[key] ?? 0
    if (flipped) {
      df = -df
      dr = -dr
    }
    const fileIndex = FILES.indexOf(from[0]) + df
    const rank = Number(from[1]) + dr
    if (fileIndex < 0 || fileIndex > 7 || rank < 1 || rank > 8) return
    const next = FILES[fileIndex] + rank
    setFocusSquare(next)
    boardRef.current?.querySelector(`[data-square="${next}"]`)?.focus()
  }

  // Create array of squares in the correct order based on flip state
  const squares = useMemo(() => {
    const result = []
    const files = flipped ? [...FILES].reverse() : FILES
    const ranks = flipped ? [...RANKS].reverse() : RANKS

    for (const rank of ranks) {
      for (const file of files) {
        const square = file + rank
        const fileIndex = FILES.indexOf(file)
        const rankIndex = RANKS.indexOf(rank)
        const isLight = (fileIndex + rankIndex) % 2 === 0

        result.push({
          square,
          isLight,
          piece: pieces[square] || null,
        })
      }
    }
    return result
  }, [pieces, flipped])

  // Get file and rank labels based on flip state
  const fileLabels = flipped ? [...FILES].reverse() : FILES
  const rankLabels = flipped ? [...RANKS].reverse() : RANKS

  return (
    <div className="chess-board-container">
      {showLabels && (
        <div className="rank-labels" aria-hidden="true">
          {rankLabels.map((rank) => (
            <div key={rank} className="rank-label">{rank}</div>
          ))}
        </div>
      )}
      <div className="board-and-files">
        <div
          className="chess-board"
          ref={boardRef}
          role="group"
          aria-label="Chess board"
        >
          {squares.map(({ square, isLight, piece }) => (
            <Square
              key={square}
              square={square}
              piece={piece}
              isLight={isLight}
              isHighlighted={highlightedSquares.includes(square)}
              isSelected={selectedSquare === square}
              isCorrect={correctSquare === square}
              isWrong={wrongSquare === square}
              showCoordinate={showCoordinates}
              onClick={onSquareClick}
              onKeyNav={handleKeyNav}
              isFocusStop={square === focusStop}
              interactive={interactive}
            />
          ))}
        </div>
        {showLabels && (
          <div className="file-labels" aria-hidden="true">
            {fileLabels.map((file) => (
              <div key={file} className="file-label">{file}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChessBoard
