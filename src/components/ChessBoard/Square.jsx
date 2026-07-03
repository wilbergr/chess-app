import { Piece } from './ChessPieces'
import './ChessBoard.css'

const PIECE_NAMES = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

const Square = ({
  square,
  piece,
  isLight,
  isHighlighted,
  isSelected,
  isCorrect,
  isWrong,
  isDragOrigin,
  isDragOver,
  showCoordinate,
  onClick,
  onKeyNav,
  isFocusStop,
  interactive,
}) => {
  let className = `square ${isLight ? 'light' : 'dark'}`
  if (isHighlighted) className += ' highlighted'
  if (isSelected) className += ' selected'
  if (isCorrect) className += ' correct'
  if (isWrong) className += ' wrong'
  if (isDragOrigin) className += ' drag-origin'
  if (isDragOver) className += ' drag-over'
  if (piece) className += ' occupied'

  // Determine piece color from piece character (uppercase = white, lowercase = black)
  const pieceColor = piece ? (piece === piece.toUpperCase() ? 'white' : 'black') : null

  // "e4, white pawn" / "e4, empty" (+ state, since the visual cue is a fill/ring)
  let label = `${square}, ${piece ? `${pieceColor} ${PIECE_NAMES[piece.toLowerCase()]}` : 'empty'}`
  if (isSelected) label += ', selected'
  else if (isHighlighted) label += ', highlighted'
  if (isCorrect) label += ', correct'
  if (isWrong) label += ', incorrect'

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(square)
    } else if (e.key.startsWith('Arrow')) {
      e.preventDefault()
      onKeyNav(square, e.key)
    }
  }

  // Roving tabindex: exactly one square is in the tab order; arrows move focus.
  const a11yProps = interactive
    ? {
        role: 'button',
        tabIndex: isFocusStop ? 0 : -1,
        'aria-label': label,
        'aria-pressed': isSelected,
        onKeyDown: handleKeyDown,
      }
    : {}

  return (
    <div className={className} onClick={() => onClick(square)} data-square={square} {...a11yProps}>
      {piece && (
        <div className="piece">
          <Piece type={piece.toLowerCase()} color={pieceColor} />
        </div>
      )}
      {showCoordinate && (
        <span className="coordinate" aria-hidden="true">{square}</span>
      )}
    </div>
  )
}

export default Square
