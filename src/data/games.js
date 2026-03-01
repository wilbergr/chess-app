// Collection of chess games for the Full Game Challenge
// Games range from simple openings to famous historical games

export const GAMES = {
  // BEGINNER: Simple opening sequences (10-15 moves)
  beginner: [
    {
      id: 'italian-game',
      title: 'Italian Game Opening',
      description: 'A classic opening for developing pieces',
      moves: [
        'e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'd6',
        'b4', 'Bb6', 'a4', 'a6', 'd3', 'Nf6', 'O-O', 'O-O'
      ],
    },
    {
      id: 'scotch-game',
      title: 'Scotch Game',
      description: 'An aggressive opening with early central tension',
      moves: [
        'e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5',
        'Be3', 'Qf6', 'c3', 'Nge7', 'Bc4', 'O-O', 'O-O', 'd6'
      ],
    },
    {
      id: 'queens-gambit',
      title: "Queen's Gambit",
      description: 'The famous d4 opening',
      moves: [
        'd4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7',
        'e3', 'O-O', 'Nf3', 'Nbd7', 'Rc1', 'c6', 'Bd3', 'dxc4', 'Bxc4', 'Nd5'
      ],
    },
    {
      id: 'london-system',
      title: 'London System',
      description: 'A solid and easy-to-learn opening',
      moves: [
        'd4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6',
        'Nd2', 'e6', 'Ngf3', 'Bd6', 'Bg3', 'O-O', 'Bd3', 'b6'
      ],
    },
    {
      id: 'four-knights',
      title: 'Four Knights Game',
      description: 'Symmetrical development of knights',
      moves: [
        'e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Bb5', 'Bb4',
        'O-O', 'O-O', 'd3', 'd6', 'Bg5', 'Bxc3', 'bxc3', 'Qe7'
      ],
    },
  ],

  // INTERMEDIATE: Medium-length games (20-30 moves)
  intermediate: [
    {
      id: 'opera-game',
      title: 'The Opera Game',
      description: 'Morphy vs Duke of Brunswick, 1858',
      moves: [
        'e4', 'e5', 'Nf3', 'd6', 'd4', 'Bg4', 'dxe5', 'Bxf3',
        'Qxf3', 'dxe5', 'Bc4', 'Nf6', 'Qb3', 'Qe7', 'Nc3', 'c6',
        'Bg5', 'b5', 'Nxb5', 'cxb5', 'Bxb5+', 'Nbd7', 'O-O-O', 'Rd8',
        'Rxd7', 'Rxd7', 'Rd1', 'Qe6', 'Bxd7+', 'Nxd7', 'Qb8+', 'Nxb8', 'Rd8#'
      ],
    },
    {
      id: 'evergreen-game',
      title: 'The Evergreen Game',
      description: 'Anderssen vs Dufresne, 1852',
      moves: [
        'e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4',
        'c3', 'Ba5', 'd4', 'exd4', 'O-O', 'd3', 'Qb3', 'Qf6',
        'e5', 'Qg6', 'Re1', 'Nge7', 'Ba3', 'b5', 'Qxb5', 'Rb8',
        'Qa4', 'Bb6', 'Nbd2', 'Bb7', 'Ne4', 'Qf5', 'Bxd3', 'Qh5',
        'Nf6+', 'gxf6', 'exf6', 'Rg8', 'Rad1', 'Qxf3', 'Rxe7+', 'Nxe7',
        'Qxd7+', 'Kxd7', 'Bf5+', 'Ke8', 'Bd7+', 'Kf8', 'Bxe7#'
      ],
    },
    {
      id: 'byrne-fischer',
      title: 'Game of the Century',
      description: 'Byrne vs Fischer, 1956 (13-year-old Bobby Fischer)',
      moves: [
        'Nf3', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'd4', 'O-O',
        'Bf4', 'd5', 'Qb3', 'dxc4', 'Qxc4', 'c6', 'e4', 'Nbd7',
        'Rd1', 'Nb6', 'Qc5', 'Bg4', 'Bg5', 'Na4', 'Qa3', 'Nxc3',
        'bxc3', 'Nxe4', 'Bxe7', 'Qb6', 'Bc4', 'Nxc3', 'Bc5', 'Rfe8+',
        'Kf1', 'Be6', 'Bxb6', 'Bxc4+', 'Kg1', 'Ne2+', 'Kf1', 'Nxd4+',
        'Kg1', 'Ne2+', 'Kf1', 'Nc3+', 'Kg1', 'axb6', 'Qb4', 'Ra4',
        'Qxb6', 'Nxd1', 'h3', 'Rxa2', 'Kh2', 'Nxf2', 'Re1', 'Rxe1',
        'Qd8+', 'Bf8', 'Nxe1', 'Bd5', 'Nf3', 'Ne4', 'Qb8', 'b5',
        'h4', 'h5', 'Ne5', 'Kg7', 'Kg1', 'Bc5+', 'Kf1', 'Ng3+',
        'Ke1', 'Bb4+', 'Kd1', 'Bb3+', 'Kc1', 'Ne2+', 'Kb1', 'Nc3+', 'Kc1', 'Rc2#'
      ],
    },
    {
      id: 'short-game-1',
      title: 'Legal Trap',
      description: 'A famous tactical trap',
      moves: [
        'e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6',
        'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'
      ],
    },
    {
      id: 'fried-liver',
      title: 'Fried Liver Attack',
      description: 'Aggressive knight sacrifice on f7',
      moves: [
        'e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5',
        'exd5', 'Nxd5', 'Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3', 'Ncb4',
        'O-O', 'c6', 'd4', 'Kd6', 'Bf4', 'Kc7', 'Nxd5+', 'Nxd5', 'Bxd5', 'cxd5', 'Qxd5'
      ],
    },
  ],

  // ADVANCED: Full famous games (30-50 moves)
  advanced: [
    {
      id: 'immortal-game',
      title: 'The Immortal Game',
      description: 'Anderssen vs Kieseritzky, 1851',
      moves: [
        'e4', 'e5', 'f4', 'exf4', 'Bc4', 'Qh4+', 'Kf1', 'b5',
        'Bxb5', 'Nf6', 'Nf3', 'Qh6', 'd3', 'Nh5', 'Nh4', 'Qg5',
        'Nf5', 'c6', 'g4', 'Nf6', 'Rg1', 'cxb5', 'h4', 'Qg6',
        'h5', 'Qg5', 'Qf3', 'Ng8', 'Bxf4', 'Qf6', 'Nc3', 'Bc5',
        'Nd5', 'Qxb2', 'Bd6', 'Bxg1', 'e5', 'Qxa1+', 'Ke2', 'Na6',
        'Nxg7+', 'Kd8', 'Qf6+', 'Nxf6', 'Be7#'
      ],
    },
    {
      id: 'kasparov-topalov',
      title: "Kasparov's Immortal",
      description: 'Kasparov vs Topalov, Wijk aan Zee 1999',
      moves: [
        'e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7',
        'Qd2', 'c6', 'f3', 'b5', 'Nge2', 'Nbd7', 'Bh6', 'Bxh6',
        'Qxh6', 'Bb7', 'a3', 'e5', 'O-O-O', 'Qe7', 'Kb1', 'a6',
        'Nc1', 'O-O-O', 'Nb3', 'exd4', 'Rxd4', 'c5', 'Rd1', 'Nb6',
        'g3', 'Kb8', 'Na5', 'Ba8', 'Bh3', 'd5', 'Qf4+', 'Ka7',
        'Rhe1', 'd4', 'Nd5', 'Nbxd5', 'exd5', 'Qd6', 'Rxd4', 'cxd4',
        'Re7+', 'Kb6', 'Qxd4+', 'Kxa5', 'b4+', 'Ka4', 'Qc3', 'Qxd5',
        'Ra7', 'Bb7', 'Rxb7', 'Qc4', 'Qxf6', 'Kxa3', 'Qxa6+', 'Kxb4',
        'c3+', 'Kxc3', 'Qa1+', 'Kd2', 'Qb2+', 'Kd1', 'Bf1', 'Rd2',
        'Rd7', 'Rxd7', 'Bxc4', 'bxc4', 'Qxh8', 'Rd3', 'Qa8', 'c3',
        'Qa4+', 'Ke1', 'f4', 'f5', 'Kc1', 'Rd2', 'Qa7'
      ],
    },
    {
      id: 'morphy-consultants',
      title: "Morphy's Brilliancy",
      description: 'Morphy vs Consultants, Paris 1858',
      moves: [
        'e4', 'e5', 'Nf3', 'd6', 'd4', 'Bg4', 'dxe5', 'Bxf3',
        'Qxf3', 'dxe5', 'Bc4', 'Nf6', 'Qb3', 'Qe7', 'Nc3', 'c6',
        'Bg5', 'b5', 'Nxb5', 'cxb5', 'Bxb5+', 'Nbd7', 'O-O-O', 'Rd8',
        'Rxd7', 'Rxd7', 'Rd1', 'Qe6', 'Bxd7+', 'Nxd7', 'Qb8+', 'Nxb8', 'Rd8#'
      ],
    },
    {
      id: 'deep-blue-kasparov',
      title: 'Deep Blue vs Kasparov',
      description: 'Game 6, 1997 - The decisive game',
      moves: [
        'e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7',
        'Ng5', 'Ngf6', 'Bd3', 'e6', 'N1f3', 'h6', 'Nxe6', 'Qe7',
        'O-O', 'fxe6', 'Bg6+', 'Kd8', 'Bf4', 'b5', 'a4', 'Bb7',
        'Re1', 'Nd5', 'Bg3', 'Kc8', 'axb5', 'cxb5', 'Qd3', 'Bc6',
        'Bf5', 'exf5', 'Rxe7', 'Bxe7', 'c4'
      ],
    },
  ],

}

// Get all games for a difficulty level
export const getGamesByDifficulty = (difficulty) => {
  return GAMES[difficulty] || []
}

// Get a specific game by ID
export const getGameById = (id) => {
  for (const difficulty of Object.keys(GAMES)) {
    const game = GAMES[difficulty].find((g) => g.id === id)
    if (game) return { ...game, difficulty }
  }
  return null
}

// Get a random game from a difficulty level
export const getRandomGame = (difficulty) => {
  const games = GAMES[difficulty]
  if (!games || games.length === 0) return null
  return games[Math.floor(Math.random() * games.length)]
}

// Get all difficulty levels
export const getDifficultyLevels = () => [
  { id: 'beginner', label: 'Beginner', description: 'Opening sequences (15-20 moves)', movesVisible: 3 },
  { id: 'intermediate', label: 'Intermediate', description: 'Famous short games (20-35 moves)', movesVisible: 2 },
  { id: 'advanced', label: 'Advanced', description: 'Full master games (30-50 moves)', movesVisible: 1 },
]

export default GAMES
