import { Chess } from 'chess.js'

// Collection of interesting positions for notation practice
// Each position has a FEN and a list of notable moves
const PRACTICE_POSITIONS = [
  // === WHITE TO MOVE ===
  // Starting position
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    description: 'Starting position',
  },
  // Open games with pieces developed
  {
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    description: 'Italian Game',
  },
  {
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    description: 'Open Game',
  },
  // Positions with castling (white)
  {
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 5',
    description: 'Castling available',
  },
  // Middle game positions (white)
  {
    fen: 'r2qkb1r/ppp2ppp/2np1n2/4p1B1/2B1P1b1/3P1N2/PPP2PPP/RN1QK2R w KQkq - 0 6',
    description: 'Middle game',
  },
  {
    fen: 'r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 6',
    description: 'Development',
  },
  // Endgame positions (white)
  {
    fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
    description: 'King and pawn endgame',
  },
  {
    fen: '4k3/8/8/8/8/8/8/4K2R w K - 0 1',
    description: 'Rook endgame',
  },

  // === BLACK TO MOVE ===
  // After 1.e4
  {
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    description: 'After 1.e4',
  },
  // After 1.d4
  {
    fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1',
    description: 'After 1.d4',
  },
  // After 1.Nf3
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
    description: 'After 1.Nf3',
  },
  // Positions with captures available (black)
  {
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq d3 0 4',
    description: 'Capture available',
  },
  // Sicilian positions (black)
  {
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    description: 'Sicilian Defense',
  },
  // Black can castle
  {
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 5',
    description: 'Black castling available',
  },
  // Check position (black must respond)
  {
    fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
    description: 'Check position',
  },
  // Middle game (black)
  {
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 b - - 0 7',
    description: 'Middle game black',
  },
  // Endgame (black)
  {
    fen: '4k3/4p3/8/8/8/8/8/4K3 b - - 0 1',
    description: 'King and pawn endgame black',
  },
  {
    fen: '4k3/8/8/8/8/8/8/r3K3 b - - 0 1',
    description: 'Rook endgame black',
  },
  // Developed position (black)
  {
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 5',
    description: 'Development black',
  },
]

// Generate a random legal move from a position
export const generateRandomMove = (chess) => {
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return null

  const move = moves[Math.floor(Math.random() * moves.length)]
  return move
}

// Generate a move of a specific type if possible
export const generateMoveOfType = (chess, type) => {
  const moves = chess.moves({ verbose: true })

  let filteredMoves = moves

  switch (type) {
    case 'piece':
      // Non-pawn, non-castling moves
      filteredMoves = moves.filter(
        (m) => m.piece !== 'p' && !m.flags.includes('k') && !m.flags.includes('q')
      )
      break
    case 'pawn':
      filteredMoves = moves.filter((m) => m.piece === 'p')
      break
    case 'capture':
      filteredMoves = moves.filter((m) => m.flags.includes('c') || m.flags.includes('e'))
      break
    case 'castle':
      filteredMoves = moves.filter((m) => m.flags.includes('k') || m.flags.includes('q'))
      break
    case 'check':
      filteredMoves = moves.filter((m) => {
        const testChess = new Chess(chess.fen())
        testChess.move(m)
        return testChess.inCheck()
      })
      break
  }

  if (filteredMoves.length === 0) {
    // Fall back to random move
    return generateRandomMove(chess)
  }

  return filteredMoves[Math.floor(Math.random() * filteredMoves.length)]
}

// Get a random position
export const getRandomPosition = () => {
  return PRACTICE_POSITIONS[Math.floor(Math.random() * PRACTICE_POSITIONS.length)]
}

// Generate a challenge with position and move
// color parameter: 'white', 'black', or null (random)
export const generateChallenge = (moveTypes = ['piece', 'pawn', 'capture'], color = null) => {
  // Try multiple times to find a good position/move combination
  for (let attempt = 0; attempt < 50; attempt++) {
    const position = getRandomPosition()
    const chess = new Chess(position.fen)

    // Check if this position has the right color to move
    const positionTurn = chess.turn() === 'w' ? 'white' : 'black'
    if (color && positionTurn !== color) {
      continue // Skip positions where it's not the requested color's turn
    }

    // Pick a random move type to try
    const type = moveTypes[Math.floor(Math.random() * moveTypes.length)]
    const move = generateMoveOfType(chess, type)

    if (move) {
      return {
        fen: position.fen,
        move: move,
        san: move.san,
        from: move.from,
        to: move.to,
        piece: move.piece,
        captured: move.captured,
        isCheck: move.san.includes('+'),
        isCheckmate: move.san.includes('#'),
        isCastle: move.flags.includes('k') || move.flags.includes('q'),
        turn: positionTurn,
      }
    }
  }

  // Fallback based on requested color
  if (color === 'black') {
    // Create a position where it's black's turn
    const chess = new Chess()
    chess.move('e4') // Make white's move first
    const move = chess.moves({ verbose: true }).find((m) => m.san === 'e5')
    return {
      fen: chess.fen(),
      move: move,
      san: 'e5',
      from: 'e7',
      to: 'e5',
      piece: 'p',
      turn: 'black',
    }
  }

  // Default fallback: starting position with e4 (white)
  const chess = new Chess()
  const move = chess.moves({ verbose: true }).find((m) => m.san === 'e4')
  return {
    fen: chess.fen(),
    move: move,
    san: 'e4',
    from: 'e2',
    to: 'e4',
    piece: 'p',
    turn: 'white',
  }
}

// Validate a user's move attempt
export const validateMove = (fen, san, fromSquare, toSquare) => {
  const chess = new Chess(fen)

  try {
    // Try to make the move
    const result = chess.move({ from: fromSquare, to: toSquare })

    if (!result) return { valid: false, reason: 'Illegal move' }

    // Check if it matches the expected notation
    if (result.san === san) {
      return { valid: true, move: result }
    } else {
      return {
        valid: false,
        reason: `You played ${result.san}, but the correct move was ${san}`,
        played: result.san,
      }
    }
  } catch {
    return { valid: false, reason: 'Invalid move' }
  }
}

// Get valid moves for a piece on a square
export const getValidMovesFrom = (fen, square) => {
  const chess = new Chess(fen)
  const moves = chess.moves({ square, verbose: true })
  return moves.map((m) => m.to)
}

// Check if there's a piece on a square that can move
export const canMoveFrom = (fen, square) => {
  const chess = new Chess(fen)
  const moves = chess.moves({ square, verbose: true })
  return moves.length > 0
}

// Parse notation to get expected from/to squares
export const parseNotation = (fen, san) => {
  const chess = new Chess(fen)

  try {
    const move = chess.move(san)
    if (move) {
      chess.undo()
      return {
        from: move.from,
        to: move.to,
        piece: move.piece,
        captured: move.captured,
      }
    }
  } catch {
    return null
  }

  return null
}

export default {
  generateChallenge,
  validateMove,
  getValidMovesFrom,
  canMoveFrom,
  parseNotation,
}
