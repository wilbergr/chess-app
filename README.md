# Chess Trainer

A React + Vite chess trainer app — practice tactics, play through famous games and openings, and test yourself with perspective-aware challenges.

## Development

```bash
npm install
npm run dev
```

Opens a dev server at `http://localhost:5173`.

## Build

```bash
npm run build
```

Outputs a production build to `dist/`.

## Deployment

Deploys to [chess.gwilber.com](https://chess.gwilber.com) via Cloudflare Pages. Cloudflare builds the site directly from this repo using:

- Build command: `npm run build`
- Output directory: `dist`
