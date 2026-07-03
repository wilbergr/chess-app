/* Pub/sub for the app-wide live region (see components/LiveRegion.jsx).
   Components call announce() for anything conveyed only visually:
   correct/wrong feedback, moves, check, timer warnings, results. */

let listener = null

export const announce = (text) => {
  listener?.(text)
}

export const setAnnounceListener = (fn) => {
  listener = fn
}
