import './ChallengeSelector.css'

const ChallengeSelector = ({ onSelectChallenge }) => {
  return (
    <div className="challenge-selector">
      <header className="header">
        <h1>Chess Trainer</h1>
        <p className="tagline">Master chess coordinates and notation</p>
      </header>

      <div className="challenges">
        <button
          className="challenge-card square-locator"
          onClick={() => onSelectChallenge('square')}
        >
          <div className="challenge-icon">
            <svg viewBox="0 0 100 100" width="80" height="80">
              {/* Simple chessboard icon */}
              <rect x="10" y="10" width="20" height="20" fill="#b58863" />
              <rect x="30" y="10" width="20" height="20" fill="#f0d9b5" />
              <rect x="50" y="10" width="20" height="20" fill="#b58863" />
              <rect x="70" y="10" width="20" height="20" fill="#f0d9b5" />
              <rect x="10" y="30" width="20" height="20" fill="#f0d9b5" />
              <rect x="30" y="30" width="20" height="20" fill="#b58863" />
              <rect x="50" y="30" width="20" height="20" fill="#f0d9b5" />
              <rect x="70" y="30" width="20" height="20" fill="#b58863" />
              <rect x="10" y="50" width="20" height="20" fill="#b58863" />
              <rect x="30" y="50" width="20" height="20" fill="#f0d9b5" />
              <rect x="50" y="50" width="20" height="20" fill="#b58863" />
              <rect x="70" y="50" width="20" height="20" fill="#f0d9b5" />
              <rect x="10" y="70" width="20" height="20" fill="#f0d9b5" />
              <rect x="30" y="70" width="20" height="20" fill="#b58863" />
              <rect x="50" y="70" width="20" height="20" fill="#f0d9b5" />
              <rect x="70" y="70" width="20" height="20" fill="#b58863" />
              {/* Highlight one square */}
              <rect x="50" y="30" width="20" height="20" fill="#81c784" opacity="0.8" />
              <text x="60" y="48" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1b5e20">e5</text>
            </svg>
          </div>
          <h2>Square Locator</h2>
          <p>
            Given a coordinate like "e4" or "h7", click the correct square on the board.
            Practice reading chess coordinates from both White and Black perspectives.
          </p>
          <div className="challenge-features">
            <span>Practice & Challenge modes</span>
            <span>3 difficulty levels</span>
            <span>White/Black perspectives</span>
          </div>
        </button>

        <button
          className="challenge-card notation"
          onClick={() => onSelectChallenge('notation')}
        >
          <div className="challenge-icon">
            <svg viewBox="0 0 100 100" width="80" height="80">
              {/* Chess notation example */}
              <rect x="5" y="20" width="90" height="60" rx="8" fill="#1e3c72" />
              <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill="white" fontFamily="Georgia, serif">Nxf7+</text>
            </svg>
          </div>
          <h2>Chess Notation</h2>
          <p>
            Read algebraic notation (Nf3, Bxe5, O-O, Qh5+) and make the correct move.
            Learn to recognize piece moves, captures, castling, and checks.
          </p>
          <div className="challenge-features">
            <span>Practice & Challenge modes</span>
            <span>Full notation support</span>
            <span>Hints available</span>
          </div>
        </button>

        <button
          className="challenge-card writing"
          onClick={() => onSelectChallenge('writing')}
        >
          <div className="challenge-icon">
            <svg viewBox="0 0 100 100" width="80" height="80">
              {/* Keyboard/typing icon */}
              <rect x="10" y="25" width="80" height="50" rx="6" fill="#37474f" />
              <rect x="18" y="33" width="12" height="10" rx="2" fill="#eceff1" />
              <rect x="34" y="33" width="12" height="10" rx="2" fill="#eceff1" />
              <rect x="50" y="33" width="12" height="10" rx="2" fill="#eceff1" />
              <rect x="66" y="33" width="12" height="10" rx="2" fill="#eceff1" />
              <rect x="18" y="47" width="12" height="10" rx="2" fill="#eceff1" />
              <rect x="34" y="47" width="12" height="10" rx="2" fill="#81c784" />
              <rect x="50" y="47" width="12" height="10" rx="2" fill="#eceff1" />
              <rect x="66" y="47" width="12" height="10" rx="2" fill="#eceff1" />
              <text x="40" y="55" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1b5e20">Nf3</text>
              <rect x="25" y="61" width="50" height="8" rx="2" fill="#eceff1" />
            </svg>
          </div>
          <h2>Write Notation</h2>
          <p>
            See a move highlighted on the board and type the correct algebraic notation.
            Learn to write moves like Nf3, Bxe5, O-O, and Qh5+.
          </p>
          <div className="challenge-features">
            <span>Practice & Challenge modes</span>
            <span>3 difficulty levels</span>
            <span>Keyboard input</span>
          </div>
        </button>

        <button
          className="challenge-card full-game"
          onClick={() => onSelectChallenge('game')}
        >
          <div className="challenge-icon">
            <svg viewBox="0 0 100 100" width="80" height="80">
              {/* Scrolling game notation */}
              <rect x="10" y="10" width="80" height="80" rx="6" fill="#2d2d2d" />
              <text x="50" y="30" textAnchor="middle" fontSize="10" fill="#888" fontFamily="Georgia, serif">1. e4 e5</text>
              <text x="50" y="45" textAnchor="middle" fontSize="10" fill="#888" fontFamily="Georgia, serif">2. Nf3 Nc6</text>
              <text x="50" y="60" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold" fontFamily="Georgia, serif">3. Bb5 a6</text>
              <text x="50" y="75" textAnchor="middle" fontSize="10" fill="#888" fontFamily="Georgia, serif">4. Ba4 Nf6</text>
              <rect x="15" y="52" width="70" height="14" fill="none" stroke="#4CAF50" strokeWidth="2" rx="2" />
            </svg>
          </div>
          <h2>Full Game</h2>
          <p>
            Play through complete chess games from notation. Execute famous games
            move by move, from opening sequences to master-level championship games.
          </p>
          <div className="challenge-features">
            <span>3 difficulty levels</span>
            <span>Famous games included</span>
            <span>Practice & Challenge</span>
          </div>
        </button>
      </div>

      <footer className="footer">
        <a href="/" className="home-link">← Back to Home</a>
      </footer>
    </div>
  )
}

export default ChallengeSelector
