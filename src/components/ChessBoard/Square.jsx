import { Piece } from './ChessPieces'
import './ChessBoard.css'

const Square = ({
  square,
  piece,
  isLight,
  isHighlighted,
  isSelected,
  isCorrect,
  isWrong,
  showCoordinate,
  onClick,
  flipped,
}) => {
  const file = square[0]
  const rank = square[1]

  let className = `square ${isLight ? 'light' : 'dark'}`
  if (isHighlighted) className += ' highlighted'
  if (isSelected) className += ' selected'
  if (isCorrect) className += ' correct'
  if (isWrong) className += ' wrong'

  // Determine piece color from piece character (uppercase = white, lowercase = black)
  const pieceColor = piece ? (piece === piece.toUpperCase() ? 'white' : 'black') : null

  return (
    <div className={className} onClick={() => onClick(square)} data-square={square}>
      {piece && (
        <div className="piece">
          <Piece type={piece.toLowerCase()} color={pieceColor} />
        </div>
      )}
      {showCoordinate && (
        <span className="coordinate">{square}</span>
      )}
    </div>
  )
}

export default Square
