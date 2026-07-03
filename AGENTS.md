# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Design system (`src/styles/tokens.css`)

chess-app is part of the shared wilbergr.github.io app family (guitar-app / piano-app).
`src/styles/tokens.css` mirrors guitar-app's foundation: the neutral dark **surface scale**
(`--bg`, `--surface`, `--surface-2`, `--border`, `--border-strong`, `--text`,
`--text-muted`, `--text-faint`), the 4px **spacing scale** (`--space-1..8`), **radius scale**
(`--radius-xs..pill`), **shadows** (`--shadow-sm/md/lg`) and **typography** tokens are the
shared family values. It is imported **first** in `main.jsx`, before `index.css`. New CSS
must use these tokens — no raw hex or ad-hoc gradients.

**The one deliberate divergence is the accent:** chess keeps its lichess-style **green**
(`--accent: #81b64c`, `--accent-hi: #6fa03e` darker for hover/pressed) instead of guitar's
copper. Text on a green fill uses `--on-accent`. Status: `--success` (green, == accent —
in chess a *correct* answer is green), `--warning` (amber `#e8a039` — challenge mode, hints,
"failed" review, selected-square highlight), `--danger`/`--danger-hi`/`--danger-text` (red;
`--danger-text` is the brighter red for text on a translucent danger tint).

**Board colors are intrinsic** and must NOT flip with the theme: `--board-light`
(parchment), `--board-dark` (wood), `--board-coord-on-light/on-dark`. They are defined only
in `:root` (no light override) so the board reads the same in both themes.

**Themes (PR5):** dark is `:root` default; light applies via `[data-theme="light"]` on
`<html>`, set by `src/hooks/useTheme.js` — a verbatim port of guitar-app's hook with
storage key **`chess-theme`**. Persisted localStorage choice wins; unset falls back to
`prefers-color-scheme` (the `@media` block in tokens.css scoped to
`:root:not([data-theme])` covers pre-JS paint) and tracks OS changes until the user
toggles. The Sun/Moon toggle lives in `App.jsx` (chess has no header bar, so
`.theme-toggle-btn` in `App.css` floats it fixed top-right, safe-area aware); it composes
`.btn .btn-secondary .btn-icon` and carries `aria-label`/`title` — same classes/labels as
guitar's for family parity. The light accent is darkened to `#4e7d2e` for WCAG AA.
Translucent tints (subtle green/amber/red fills & borders) use
`color-mix(in srgb, var(--token) N%, transparent)` inline rather than one-off rgba tokens.

## Icons — lucide-react (PR3)

UI chrome uses `lucide-react` icons — **no emoji as UI**. A global `.lucide` rule in
`index.css` sizes every icon at `1em`/`currentColor`, so icons scale with the parent's
font-size; larger sites (`.mode-icon`, `.result-icon`, `.game-icon`) just set
font-size + a token color (practice=accent, challenge=warning, passed=success,
failed=warning). Icons paired with text are `aria-hidden`; meaning-bearing icons
(the practice-tally Check/X) carry `role="img"` + `aria-label`. "Playing as"/turn
indicators render `<Circle>` with `.piece-dot-white`/`.piece-dot-black` (`index.css`),
filled with the **intrinsic board tokens** so they don't flip with the theme.
**Board piece SVGs (`ChessPieces.jsx`) are intrinsic — never swap them for icon art.**
ChallengeSelector menu-card SVGs are colored via inline `style={{fill:'var(--token)'}}`
— SVG presentation attributes can't hold `var()`. Chess coordinates display
**lowercase** ("e4") everywhere — never `.toUpperCase()` a square for display.
The unreachable Expert/blindfold mode in GameChallenge (no expert games exist in
`data/games.js`) was removed in PR3; if blindfold returns, rebuild it deliberately.

## Shared button classes (`index.css`)

`.btn` + variants `.btn-primary` (green), `.btn-secondary`, `.btn-ghost`, `.btn-danger`
(red), `.btn-icon` — all enforce `min-height/min-width: 44px` touch targets. Compose in
markup: `<button className="btn btn-primary start-button">`. Component CSS keeps only
positional/size/state overrides (e.g. `.start-button` bumps font/padding; `.hint-button`
adds the amber tint on top of `.btn`). Selectable pills (`.option-button`,
`.perspective-option`) compose `.btn .btn-secondary` and add a `.selected` green state; that
state has a `:hover` twin so it isn't overridden by `.btn-secondary:hover` (higher
specificity). Cards (`.mode-button`, `.difficulty-card`, `.game-card`, `.challenge-card`,
`.difficulty-option`) are NOT `.btn` — they stay column-layout tokenized surfaces.

## Responsive layout & board sizing (PR2)

**`--board-size` is the single source of truth for board dimensions**, defined on `:root`
in `src/components/ChessBoard/ChessBoard.css` and consumed by the board grid, rank/file
label tracks, and the blindfold placeholder in `GameChallenge.css`. Never hardcode
`min(70vw, 480px)`-style board math again — change the one variable.

The formula is `min(calc(100vw - <chrome>), 480px, 85dvh)` where `<chrome>` is a
**constant allowance** for page padding + the 12px rank-label column + 4px container gap:
64px on desktop (2×24px max page padding), 32px under the 500px breakpoint (2×8px playing
padding). It is deliberately NOT `:has(.rank-labels)`-dependent so the board doesn't
resize when the "Show coordinates" toggle flips mid-game. The `85dvh` term caps the board
on landscape phones / short windows. If you change any playing-screen horizontal padding
or the label column width, the allowance must be updated to match — at 390px the current
math yields a 358px board = exactly 44px squares (the touch-target floor).

**Breakpoint convention:** one mobile breakpoint, `@media (max-width: 500px)`, used in
every component stylesheet. Mobile blocks: playing screens drop to `--space-2` horizontal
padding (part of the board-size contract above), `.mode-buttons` stack vertically,
`.result-stats` go 2-column, headline type steps down. `.game-info-bar` (GameChallenge)
wraps + centers on mobile so title/progress/timer never overflow.

**Touch targets:** everything interactive is ≥44px — `.btn*` enforce it; `.coords-toggle`
(checkbox label in `index.css`) carries its own `min-height: 44px` since it's not a `.btn`.

**Viewport units / safe area:** `min-height` uses the `100vh` + `100dvh` double-declaration
pattern (dvh wins where supported). `.app` pads with `env(safe-area-inset-left/right)`;
`viewport-fit=cover` is set in `index.html` — don't remove it or the insets go dead.

## Accessibility (PR4)

**Board keyboard model (roving tabindex):** every square in an interactive board is
`role="button"` with an `aria-label` ("e4, white pawn" / "e4, empty" + state suffix) and
`aria-pressed` for selection. Exactly ONE square carries `tabIndex=0` (`focusStop` state in
`ChessBoard.jsx`, defaulting to the bottom-left *visual* square); the rest are `-1`. Arrow
keys move focus in **visual** directions (deltas are inverted when `flipped`), Enter/Space
calls the same `onClick(square)` as a mouse click — never add a parallel keyboard-only code
path. Display-only boards (Write Notation) pass `interactive={false}` to `ChessBoard`, which
renders plain divs — don't expose 64 do-nothing buttons.

**Live region:** ONE app-wide `aria-live="polite"` region (`components/LiveRegion.jsx`,
mounted once in `App.jsx`; `.sr-only` util in `index.css`). Components call `announce()`
from `services/announcer.js` for anything conveyed only visually: correct/wrong/timeout
feedback, opponent moves, check/checkmate (derived from `+`/`#` in SAN), timer warnings,
mode changes, results. It's a singleton on purpose — per-screen live regions remount on
screen changes and freshly-mounted regions never announce. `announce()` appends a
zero-width space when the same text repeats so "Correct!" twice still re-announces.

**Non-color square cues** (`ChessBoard.css`): every color state has a shape twin —
highlighted = accent ring + center **dot** (ring-only when `.occupied` so the piece stays
visible), selected = **two-tone** ring (warning + `--board-ink`), correct = drawn
**checkmark** pseudo-element, wrong = drawn **X** (two crossed bars). Cues are CSS-drawn,
not glyph characters (no-emoji rule). `--board-ink` is a new **intrinsic** token (never
theme-flipped) for on-board cues: square `:focus-visible` uses a 3px *inset* `--board-ink`
outline because (a) the board clips overflow and (b) theme accents fall below 3:1 on the
wood/parchment squares; `--board-ink` stays ≥6:1 on both.

**Focus-visible:** the global rule in `index.css` (2px `--accent`, offset 2px) covers
button/a/input/select/textarea plus a zero-specificity `:where([role="button"])` arm so the
board's own rule always wins. Keep new interactive elements inside these selectors.

**Contrast floors (AA):** `--text-faint` is `#8a919e` dark / `#5d6673` light — chosen to
clear 4.5:1 on all three surfaces in each theme; don't lower them. Warning-state timers use
`--danger-text`, not `--danger` (solid danger red is ~3.5:1 on the dark bg).
`--board-coord-on-light` alpha is 0.85 (4.5:1 on parchment).

**Reduced motion:** one global `@media (prefers-reduced-motion: reduce)` block in
`index.css` collapses ALL animations/transitions — new keyframes need no individual wrap.

**Landmarks/headings:** `App.jsx` renders `<main>` + a `.sr-only` h1 on challenge screens
(the selector screen has the visible h1); challenge screens start at h2. Selectable pills
carry `aria-pressed`; decorative SVGs/icons are `aria-hidden`; the board's external
rank/file label strips are `aria-hidden` (squares already announce coordinates).

## Board interaction — THREE co-existing input paths (PR5)

Move-input boards (GameChallenge, NotationChallenge — the ones that pass `draggable` to
`ChessBoard`) support **click-click**, **keyboard** (PR4 roving tabindex + Enter/Space),
and **press-and-hold drag** (Pointer Events, mouse + touch). All three funnel into the
consumer's single `onSquareClick(square)` handler — **never add a parallel input path
that validates or applies moves itself.**

**Drag is a synthesizer, not a second rules engine.** It lives entirely in
`ChessBoard.jsx`: crossing a 6px threshold (`DRAG_THRESHOLD`) lifts the piece and
synthesizes `onSquareClick(source)` (the consumer's own select branch lights the
valid-move highlights); dropping on a legal target synthesizes `onSquareClick(target)`
(same validate/apply/announce path as a click, so live-region announcements come for
free). Sub-threshold presses fall through to the native `click` event = click-to-move
untouched. Drop legality and liftability use the same shared
`canMoveFrom`/`getValidMovesFrom` (`services/notationGenerator.js`) the consumers use.

**Selection coherence rules:** drop-on-source keeps the piece selected (matches a plain
click's select); a cancelled drag (off-board/illegal) deselects only if the drag itself
created the selection (`wasSelected` flag) — a pre-existing selection survives untouched.
After a completed drag, the browser's trailing `click` on the source square is swallowed
via a one-shot `suppressClickRef` (cleared on a 0ms timeout for browsers that don't fire
it). A drag records its lift-time `fen`; if the FEN changes mid-drag (opponent auto-play)
the drag goes inert (`liveDrag` derivation) and never synthesizes a drop.

**Mechanics:** handlers are delegated on the `.chess-board` div, but `setPointerCapture`
targets the **source square element** — capturing on the board would retarget `click` and
break click-to-move. Ghost piece (`.drag-ghost`, `position: fixed`, `aria-hidden`) is
positioned via direct DOM `transform` writes after first paint so 60hz pointermove doesn't
re-render 64 squares. `touch-action: none` only on `.draggable .square.occupied` — drags
start on pieces, empty squares still scroll the page. Drag-state CSS: `.drag-origin`
(source piece dims to 0.35), `.drag-over` (legal square under pointer: accent +
`--board-ink` two-tone ring, declared after `.highlighted` so it wins).

**Promotion is auto-queen** (`promotion: 'q'` hardcoded in GameChallenge's
`handleSquareClick`); drag inherits this. If a promotion picker is ever added, put it in
the consumer's click handler so all three input paths get it.
