// Performance Tracker for Chess Challenges
// Tracks attempts, accuracy, and timing statistics

class PerformanceTracker {
  constructor() {
    this.results = []
    this.challengeStartTime = null
    this.currentAttemptStartTime = null
  }

  // Start a new challenge session
  startChallenge() {
    this.results = []
    this.challengeStartTime = Date.now()
    this.currentAttemptStartTime = Date.now()
  }

  // Start timing for the current question
  startAttempt() {
    this.currentAttemptStartTime = Date.now()
  }

  // Record an attempt result
  recordAttempt(correct, data = {}) {
    const now = Date.now()
    const responseTime = now - this.currentAttemptStartTime

    this.results.push({
      correct,
      responseTime,
      timestamp: now,
      ...data,
    })

    // Reset for next attempt
    this.currentAttemptStartTime = now

    return {
      correct,
      responseTime,
    }
  }

  // Get total correct answers
  getCorrectCount() {
    return this.results.filter((r) => r.correct).length
  }

  // Get total incorrect answers
  getIncorrectCount() {
    return this.results.filter((r) => !r.correct).length
  }

  // Get accuracy percentage
  getAccuracy() {
    if (this.results.length === 0) return 0
    return Math.round((this.getCorrectCount() / this.results.length) * 100)
  }

  // Get average response time in milliseconds
  getAverageTime() {
    if (this.results.length === 0) return 0
    const total = this.results.reduce((sum, r) => sum + r.responseTime, 0)
    return Math.round(total / this.results.length)
  }

  // Get best (fastest) correct response time
  getBestTime() {
    const correctResults = this.results.filter((r) => r.correct)
    if (correctResults.length === 0) return 0
    return Math.min(...correctResults.map((r) => r.responseTime))
  }

  // Get total challenge duration
  getTotalTime() {
    if (!this.challengeStartTime) return 0
    return Date.now() - this.challengeStartTime
  }

  // Get total number of attempts
  getTotalAttempts() {
    return this.results.length
  }

  // Check if user passed (75% accuracy threshold)
  hasPassed() {
    return this.getAccuracy() >= 75
  }

  // Get full results object
  getResults() {
    return {
      correct: this.getCorrectCount(),
      incorrect: this.getIncorrectCount(),
      total: this.getTotalAttempts(),
      accuracy: this.getAccuracy(),
      averageTime: this.getAverageTime(),
      bestTime: this.getBestTime(),
      totalTime: this.getTotalTime(),
      passed: this.hasPassed(),
      details: [...this.results],
    }
  }

  // Reset tracker
  reset() {
    this.results = []
    this.challengeStartTime = null
    this.currentAttemptStartTime = null
  }
}

export default PerformanceTracker
