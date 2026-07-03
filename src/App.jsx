import { useState } from 'react'
import LiveRegion from './components/LiveRegion'
import ChallengeSelector from './components/ChallengeSelector/ChallengeSelector'
import SquareChallenge from './components/SquareChallenge/SquareChallenge'
import NotationChallenge from './components/NotationChallenge/NotationChallenge'
import NotationWriting from './components/NotationWriting/NotationWriting'
import GameChallenge from './components/GameChallenge/GameChallenge'
import './App.css'

function App() {
  const [currentChallenge, setCurrentChallenge] = useState(null)

  const handleSelectChallenge = (type) => {
    setCurrentChallenge(type)
  }

  const handleBack = () => {
    setCurrentChallenge(null)
  }

  return (
    <main className="app">
      <LiveRegion />
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
