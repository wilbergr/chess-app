import { useEffect, useState } from 'react'
import { setAnnounceListener } from '../services/announcer'

/* Single app-wide polite live region, mounted once in App so it persists
   across screen changes — a freshly-mounted region never announces its
   initial content. Fed by announce() from services/announcer.js. */

const LiveRegion = () => {
  const [message, setMessage] = useState('')

  useEffect(() => {
    // A zero-width space toggles the DOM content so repeating the same text
    // ("Correct!" twice in a row) is still re-announced.
    setAnnounceListener((text) =>
      setMessage((prev) => (prev === text ? text + '\u200B' : text))
    )
    return () => setAnnounceListener(null)
  }, [])

  return (
    <div className="sr-only" role="status" aria-live="polite">
      {message}
    </div>
  )
}

export default LiveRegion
