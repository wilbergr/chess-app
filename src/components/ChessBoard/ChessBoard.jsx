import { useMemo, useRef, useState } from 'react'
import Square from './Square'
import { Piece } from './ChessPieces'
import { canMoveFrom, getValidMovesFrom } from '../../services/notationGenerator'
import './ChessBoard.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

// Pointer movement (px) before a press becomes a drag; anything less stays a click.
const DRAG_THRESHOLD = 6

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
  // true enables press-and-hold drag of pieces (move-input boards only).
  // Drag is a third input path alongside click-click and keyboard: it
  // synthesizes the same onSquareClick(source) / onSquareClick(target) calls,
  // so selection, validation, move-apply, and announcements never fork.
  draggable = false,
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

  // --- Drag-and-drop (pointer events, so mouse and touch share one path) ---
  // pendingRef: press candidate before the threshold is crossed.
  // drag state: { from, piece, targets, wasSelected, size, x, y, fen } once
  // lifted. After the first paint, ghost position is written straight to the
  // DOM (ghostRef) so pointermove doesn't re-render 64 squares at 60hz.
  const pendingRef = useRef(null)
  const ghostRef = useRef(null)
  const suppressClickRef = useRef(false)
  const [drag, setDrag] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  // A drag is only live while the position it lifted from is still on the
  // board; if the FEN changes mid-drag (opponent auto-play, feedback reset)
  // the drag goes inert and the next pointer event clears it.
  const liveDrag = drag && drag.fen === fen ? drag : null

  const moveGhost = (x, y) => {
    if (ghostRef.current) {
      ghostRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }
  }

  // Map viewport coordinates to a square name (accounting for orientation).
  const squareAt = (x, y) => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return null
    const col = Math.floor(((x - rect.left) / rect.width) * 8)
    const row = Math.floor(((y - rect.top) / rect.height) * 8)
    if (col < 0 || col > 7 || row < 0 || row > 7) return null
    const fileIndex = flipped ? 7 - col : col
    const rank = flipped ? row + 1 : 8 - row
    return FILES[fileIndex] + rank
  }

  const handlePointerDown = (e) => {
    if (pendingRef.current || e.button !== 0) return
    const el = e.target.closest?.('[data-square]')
    if (!el) return
    const square = el.dataset.square
    const piece = pieces[square]
    // Only pieces with legal moves lift — same rule the click path uses to
    // decide selectability, so a press on an opponent piece stays a click.
    if (!piece || !canMoveFrom(fen, square)) return
    el.setPointerCapture(e.pointerId)
    pendingRef.current = {
      from: square,
      piece,
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
    }
  }

  const handlePointerMove = (e) => {
    const pending = pendingRef.current
    if (!pending || e.pointerId !== pending.pointerId) return

    // Drag went stale (position changed under it): snap it away.
    if (drag && !liveDrag) {
      pendingRef.current = null
      setDrag(null)
      setDragOver(null)
      return
    }

    if (!drag) {
      const dx = e.clientX - pending.x
      const dy = e.clientY - pending.y
      if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return
      // Threshold crossed: lift the piece. Reuse the click path to select it
      // (which also lights up the consumer's valid-move highlights).
      const wasSelected = selectedSquare === pending.from
      if (!wasSelected) onSquareClick(pending.from)
      const rect = boardRef.current?.getBoundingClientRect()
      setDrag({
        from: pending.from,
        piece: pending.piece,
        targets: getValidMovesFrom(fen, pending.from),
        wasSelected,
        size: rect ? rect.width / 8 : 48,
        // lift-time pointer position, for the ghost's first paint only —
        // later positions go straight to the DOM via moveGhost()
        x: e.clientX,
        y: e.clientY,
        fen,
      })
      setDragOver(null)
      return
    }

    // If the consumer refused the selection (paused, feedback showing…),
    // the drag is inert — drop it rather than show a misleading lift.
    if (selectedSquare !== drag.from) {
      pendingRef.current = null
      setDrag(null)
      setDragOver(null)
      return
    }

    moveGhost(e.clientX, e.clientY)
    const over = squareAt(e.clientX, e.clientY)
    const legalOver = over && over !== drag.from && drag.targets.includes(over) ? over : null
    if (legalOver !== dragOver) setDragOver(legalOver)
  }

  const endDrag = (dropSquare) => {
    const selected = selectedSquare === drag.from
    if (selected && dropSquare && dropSquare !== drag.from && drag.targets.includes(dropSquare)) {
      // Legal drop: same move-apply path as click-to-move / keyboard.
      onSquareClick(dropSquare)
    } else if (selected && !drag.wasSelected && dropSquare !== drag.from) {
      // Cancelled (off-board / illegal): undo the selection this drag created
      // via the click path's own same-square deselect. Dropping back on the
      // source keeps the piece selected, matching a plain click's select.
      onSquareClick(drag.from)
    }
    // Swallow the click the browser fires after pointerup on the source
    // square, so a completed drag doesn't also toggle selection.
    suppressClickRef.current = true
    setTimeout(() => {
      suppressClickRef.current = false
    }, 0)
    setDrag(null)
    setDragOver(null)
  }

  const handlePointerUp = (e) => {
    const pending = pendingRef.current
    if (!pending || e.pointerId !== pending.pointerId) return
    pendingRef.current = null
    // Below the threshold this was a plain click — the native click event
    // drives the existing click-to-move path untouched.
    if (!drag) return
    if (!liveDrag) {
      // Stale drag: just clear it; suppress the trailing click too.
      suppressClickRef.current = true
      setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
      setDrag(null)
      setDragOver(null)
      return
    }
    endDrag(squareAt(e.clientX, e.clientY))
  }

  const handlePointerCancel = (e) => {
    const pending = pendingRef.current
    if (!pending || e.pointerId !== pending.pointerId) return
    pendingRef.current = null
    if (liveDrag) {
      endDrag(null)
    } else if (drag) {
      setDrag(null)
      setDragOver(null)
    }
  }

  const handleSquareClick = (square) => {
    if (suppressClickRef.current) return
    onSquareClick(square)
  }

  const dragEnabled = draggable && interactive
  const dragHandlers = dragEnabled
    ? {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
      }
    : {}

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
          className={`chess-board${dragEnabled ? ' draggable' : ''}${liveDrag ? ' dragging' : ''}`}
          ref={boardRef}
          role="group"
          aria-label="Chess board"
          {...dragHandlers}
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
              isDragOrigin={liveDrag?.from === square}
              isDragOver={liveDrag != null && dragOver === square}
              showCoordinate={showCoordinates}
              onClick={handleSquareClick}
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
      {liveDrag && (
        <div
          className="drag-ghost"
          ref={ghostRef}
          aria-hidden="true"
          style={{
            width: liveDrag.size,
            height: liveDrag.size,
            transform: `translate(${liveDrag.x}px, ${liveDrag.y}px) translate(-50%, -50%)`,
          }}
        >
          <Piece
            type={liveDrag.piece.toLowerCase()}
            color={liveDrag.piece === liveDrag.piece.toUpperCase() ? 'white' : 'black'}
          />
        </div>
      )}
    </div>
  )
}

export default ChessBoard
