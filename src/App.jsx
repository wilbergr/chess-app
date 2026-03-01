import { useState } from 'react'
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
    <div className="app">
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
    </div>
  )
}

export default App
