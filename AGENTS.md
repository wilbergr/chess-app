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
