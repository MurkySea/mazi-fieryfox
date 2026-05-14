# Murky Sea Chronicles

Dark fantasy isekai RPG productivity app. Track quests, rituals, companions, and boss battles in the world of Valdris.

## Stack

- React 18 + Vite
- Vercel serverless functions (API proxy)
- xAI Grok — AI image generation (`/api/image`)
- Anthropic Claude — companion dialogue (`/api/dialogue`)
- vite-plugin-pwa — iPhone PWA installation

## Setup

```bash
npm install
npm run dev
```

## Environment Variables (Vercel)

| Variable | Value |
|---|---|
| `XAI_KEY` | Your xAI API key |
| `ANTHROPIC_KEY` | Your Anthropic API key |

## PWA Icons

Add these PNG files to `/public/` for full icon support:
- `pwa-192x192.png` — 192×192 PNG
- `pwa-512x512.png` — 512×512 PNG
- `apple-touch-icon.png` — 180×180 PNG

## Deploying to Vercel

1. Push this repo to GitHub
2. Import the repo at vercel.com/new
3. Add environment variables in Vercel dashboard → Settings → Environment Variables
4. Deploy
