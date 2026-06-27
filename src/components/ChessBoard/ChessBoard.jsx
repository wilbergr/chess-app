import { useMemo } from 'react'
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
}) => {
  const pieces = useMemo(() => parseFEN(fen), [fen])

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
        <div className="rank-labels">
          {rankLabels.map((rank) => (
            <div key={rank} className="rank-label">{rank}</div>
          ))}
        </div>
      )}
      <div className="board-and-files">
        <div className="chess-board">
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
              flipped={flipped}
            />
          ))}
        </div>
        {showLabels && (
          <div className="file-labels">
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
