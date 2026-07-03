import { ArrowLeft } from 'lucide-react'
import './ChallengeSelector.css'

/* Menu-card SVG palette — design tokens via inline style (SVG presentation
   attributes can't hold var()). Board squares use the intrinsic board tokens. */
const svgFill = (token) => ({ fill: `var(${token})` })

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
            <svg viewBox="0 0 100 100" width="80" height="80" aria-hidden="true">
              {/* Simple chessboard icon */}
              <rect x="10" y="10" width="20" height="20" style={svgFill('--board-dark')} />
              <rect x="30" y="10" width="20" height="20" style={svgFill('--board-light')} />
              <rect x="50" y="10" width="20" height="20" style={svgFill('--board-dark')} />
              <rect x="70" y="10" width="20" height="20" style={svgFill('--board-light')} />
              <rect x="10" y="30" width="20" height="20" style={svgFill('--board-light')} />
              <rect x="30" y="30" width="20" height="20" style={svgFill('--board-dark')} />
              <rect x="50" y="30" width="20" height="20" style={svgFill('--board-light')} />
              <rect x="70" y="30" width="20" height="20" style={svgFill('--board-dark')} />
              <rect x="10" y="50" width="20" height="20" style={svgFill('--board-dark')} />
              <rect x="30" y="50" width="20" height="20" style={svgFill('--board-light')} />
              <rect x="50" y="50" width="20" height="20" style={svgFill('--board-dark')} />
              <rect x="70" y="50" width="20" height="20" style={svgFill('--board-light')} />
              <rect x="10" y="70" width="20" height="20" style={svgFill('--board-light')} />
              <rect x="30" y="70" width="20" height="20" style={svgFill('--board-dark')} />
              <rect x="50" y="70" width="20" height="20" style={svgFill('--board-light')} />
              <rect x="70" y="70" width="20" height="20" style={svgFill('--board-dark')} />
              {/* Highlight one square */}
              <rect x="50" y="30" width="20" height="20" style={svgFill('--accent')} opacity="0.8" />
              <text x="60" y="48" textAnchor="middle" fontSize="14" fontWeight="bold" style={svgFill('--on-accent')}>e5</text>
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
            <svg viewBox="0 0 100 100" width="80" height="80" aria-hidden="true">
              {/* Chess notation example */}
              <rect x="5" y="20" width="90" height="60" rx="8" style={svgFill('--surface-2')} />
              <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" style={svgFill('--text')} fontFamily="Georgia, serif">Nxf7+</text>
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
            <svg viewBox="0 0 100 100" width="80" height="80" aria-hidden="true">
              {/* Keyboard/typing icon */}
              <rect x="10" y="25" width="80" height="50" rx="6" style={svgFill('--surface-2')} />
              <rect x="18" y="33" width="12" height="10" rx="2" style={svgFill('--text-muted')} />
              <rect x="34" y="33" width="12" height="10" rx="2" style={svgFill('--text-muted')} />
              <rect x="50" y="33" width="12" height="10" rx="2" style={svgFill('--text-muted')} />
              <rect x="66" y="33" width="12" height="10" rx="2" style={svgFill('--text-muted')} />
              <rect x="18" y="47" width="12" height="10" rx="2" style={svgFill('--text-muted')} />
              <rect x="34" y="47" width="12" height="10" rx="2" style={svgFill('--accent')} />
              <rect x="50" y="47" width="12" height="10" rx="2" style={svgFill('--text-muted')} />
              <rect x="66" y="47" width="12" height="10" rx="2" style={svgFill('--text-muted')} />
              <text x="40" y="55" textAnchor="middle" fontSize="7" fontWeight="bold" style={svgFill('--on-accent')}>Nf3</text>
              <rect x="25" y="61" width="50" height="8" rx="2" style={svgFill('--text-muted')} />
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
            <svg viewBox="0 0 100 100" width="80" height="80" aria-hidden="true">
              {/* Scrolling game notation */}
              <rect x="10" y="10" width="80" height="80" rx="6" style={svgFill('--surface-2')} />
              <text x="50" y="30" textAnchor="middle" fontSize="10" style={svgFill('--text-muted')} fontFamily="Georgia, serif">1. e4 e5</text>
              <text x="50" y="45" textAnchor="middle" fontSize="10" style={svgFill('--text-muted')} fontFamily="Georgia, serif">2. Nf3 Nc6</text>
              <text x="50" y="60" textAnchor="middle" fontSize="12" style={svgFill('--text')} fontWeight="bold" fontFamily="Georgia, serif">3. Bb5 a6</text>
              <text x="50" y="75" textAnchor="middle" fontSize="10" style={svgFill('--text-muted')} fontFamily="Georgia, serif">4. Ba4 Nf6</text>
              <rect x="15" y="52" width="70" height="14" fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth="2" rx="2" />
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
        <a href="/" className="btn btn-ghost home-link"><ArrowLeft aria-hidden="true" /> Back to Home</a>
      </footer>
    </div>
  )
}

export default ChallengeSelector
