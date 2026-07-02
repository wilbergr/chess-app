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

**Themes:** dark is `:root` default; light applies via `@media (prefers-color-scheme: light)`
(and a reserved `[data-theme="light"]` block for a future toggle — chess-app has no theme
toggle yet, mirroring piano-app). The light accent is darkened to `#4e7d2e` for WCAG AA.
Translucent tints (subtle green/amber/red fills & borders) use
`color-mix(in srgb, var(--token) N%, transparent)` inline rather than one-off rgba tokens.

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
