# MiMo TTS Playground

Web-based playground for Xiaomi MiMo-V2.5-TTS speech synthesis API.

Supports three TTS models:
- **内置音色** (`mimo-v2.5-tts`) — 9 built-in voices, style control, singing
- **声音设计** (`mimo-v2.5-tts-voicedesign`) — custom voice from text description
- **声音克隆** (`mimo-v2.5-tts-voiceclone`) — replicate voice from audio sample

## Quick Start (Local Dev)

```bash
npm install
cp .env.example .env   # fill in your API key
npm run dev
```

Open http://localhost:5173

## Deploy to Cloudflare Pages

### 1. Push to GitHub

```bash
git init
git add -A
git commit -m "init"
gh repo create mimotts --public --source=. --push
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create**
2. Connect your GitHub repo
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Set environment variables (Settings → Environment variables):
   - `MIMO_API_KEY` — your MiMo API key
   - `MIMO_BASE_URL` — API endpoint (default: `https://token-plan-sgp.xiaomimimo.com/v1`)

### 3. Deploy via CLI (alternative)

```bash
npx wrangler pages secret put MIMO_API_KEY   # enter your key
npx wrangler pages deploy dist
```

## Architecture

```
Browser  ──POST /api/tts──►  Cloudflare Pages Function  ──►  MiMo TTS API
                              (injects API key server-side)
```

- **API key stays server-side** — never exposed to the browser
- **No CORS issues** — proxy runs on the same origin
- **Zero backend cost** — Cloudflare Workers free tier (100k req/day)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MIMO_API_KEY` | Yes | — | MiMo platform API key |
| `MIMO_BASE_URL` | No | `https://token-plan-sgp.xiaomimimo.com/v1` | API base URL |

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Cloudflare Pages Functions (edge runtime)

## License

MIT
