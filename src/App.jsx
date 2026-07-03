import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import useTheme from './hooks/useTheme'
import LiveRegion from './components/LiveRegion'
import ChallengeSelector from './components/ChallengeSelector/ChallengeSelector'
import SquareChallenge from './components/SquareChallenge/SquareChallenge'
import NotationChallenge from './components/NotationChallenge/NotationChallenge'
import NotationWriting from './components/NotationWriting/NotationWriting'
import GameChallenge from './components/GameChallenge/GameChallenge'
import './App.css'

function App() {
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const { theme, toggleTheme } = useTheme()

  const handleSelectChallenge = (type) => {
    setCurrentChallenge(type)
  }

  const handleBack = () => {
    setCurrentChallenge(null)
  }

  return (
    <main className="app">
      <LiveRegion />
      {/* Chess has no persistent header bar, so the theme toggle floats in the
          viewport corner on every screen (guitar-app keeps its twin in the
          header). Same classes/labels as guitar's toggle for family parity. */}
      <button
        type="button"
        className="btn btn-secondary btn-icon theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      >
        {theme === 'light'
          ? <Moon aria-hidden="true" />
          : <Sun aria-hidden="true" />}
      </button>
      {/* Challenge screens start at h2; the selector screen has the visible h1. */}
      {currentChallenge !== null && (
        <h1 className="sr-only">Chess Trainer</h1>
      )}
      {currentChallenge === null && (
        <ChallengeSelector onSelectChallenge={handleSelectChallenge} />
      )}

      {currentChallenge === 'square' && (
        <SquareChallenge onBack={handleBack} />
      )}

      {currentChallenge === 'notation' && (
        <NotationChallenge onBack={handleBack} />
      )}

      {currentChallenge === 'writing' && (
        <NotationWriting onBack={handleBack} />
      )}

      {currentChallenge === 'game' && (
        <GameChallenge onBack={handleBack} />
      )}
    </main>
  )
}

export default App
