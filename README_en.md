<div align="center">

# MiMo TTS Playground

**A web-based speech synthesis playground powered by Xiaomi MiMo-V2.5-TTS**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com)

[中文](README.md) | [English](#introduction)

</div>

---

## Introduction

MiMo TTS Playground is a web application for speech synthesis built on Xiaomi's **MiMo-V2.5-TTS** model family. It supports multiple generation modes including built-in voices, voice design, and voice cloning.

> **Official Docs**: [Xiaomi MiMo Platform - Speech Synthesis](https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5)

## Features

### Three Synthesis Modes

| Model | Description | Highlights |
|-------|-------------|------------|
| `mimo-v2.5-tts` | **Built-in Voices** | 9 high-quality voices, style control, dialects, singing |
| `mimo-v2.5-tts-voicedesign` | **Voice Design** | Customize voices via text description, no audio sample needed |
| `mimo-v2.5-tts-voiceclone` | **Voice Clone** | Upload an audio sample (WAV/MP3, max 10MB) to clone the target voice |

### Voice Selection (9 voices)

**Chinese Voices:**
- Bingtang — warm female
- Jasmine — sweet female
- Soda — energetic male
- Birch — deep male

**English Voices:**
- Mia — Female
- Chloe — Female
- Milo — Male
- Dean — Male

**Default:**
- MiMo — auto-detect language

### Director Mode

Built-in voice mode supports structured director control for precise voice acting across three dimensions:

- **Role** — speaker identity and persona
- **Scene** — context and atmosphere
- **Direction** — specific performance instructions

Alternatively, use natural-language style presets: happy, gentle whisper, news anchor, storytelling, Northeastern dialect, Sichuan dialect, Cantonese, singing mode, and more.

### Audio Tags

**Global style tags** — inserted at the beginning of text, wrapped in parentheses `(tag)`. 40+ tags available covering emotions, tone, dialect, and singing.

**Inline effect tags** — inserted within text, wrapped in square brackets `[tag]`. 28+ tags available:

```
[sigh] [deep breath] [laugh] [burst out laughing] [crying] [nervous] [voice trembling] [pause] [cough] [clear throat]
```

### Voice Design Presets

Voice design mode provides 9 preset templates for quick voice generation:

Warm female, magnetic male, ASMR whisper, podcast host, cinematic narrator, audiobook reader, news anchor, children's story, rap style.

### Audio Output

Supports **WAV** and **PCM16** (24kHz mono) formats. PCM16 is automatically converted to WAV on the client side for playback.

### Additional Features

- Generation history (up to 20 items stored in localStorage)
- Auto-play and audio download
- Drag-and-drop file upload (voice clone mode)
- Dark/light theme toggle
- Character counter

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/sergioperezcheco/MiMoTTS.git
cd MiMoTTS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your API key:

```env
MIMO_API_KEY=your_api_key_here
MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1
```

> Get your API key at [Xiaomi MiMo Platform](https://platform.xiaomimimo.com)

### 4. Start the dev server

```bash
npm run dev
```

Visit http://localhost:5173 to try it out.

## Deploy to Cloudflare Pages

### Option A: GitHub Auto-Deploy

1. Fork or clone the repository
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create** > **Pages** > **Connect to Git**
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add environment variables in **Settings** > **Environment variables**:
   - `MIMO_API_KEY` — your MiMo API key
   - `MIMO_BASE_URL` — API endpoint (default: `https://token-plan-sgp.xiaomimimo.com/v1`)
5. Click **Save and Deploy**

### Option B: GitHub Actions (Recommended for production)

The project includes a GitHub Actions workflow that auto-deploys on push to `main`.

1. Create a Cloudflare API Token at **My Profile** > **API Tokens** (use the "Edit Cloudflare Workers" template)
2. Find your Account ID in the Cloudflare Dashboard sidebar
3. Add GitHub Secrets in **Settings** > **Secrets and variables** > **Actions**:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Set `MIMO_API_KEY` in the Cloudflare Dashboard environment variables
5. Push to `main`:
   ```bash
   git push origin main
   ```

### Option C: CLI Deploy

```bash
npx wrangler pages secret put MIMO_API_KEY
npx wrangler pages deploy dist
```

## Architecture

```
Browser (React App)  --POST /api/tts-->  Cloudflare Pages Function (Edge)
                                                    |
                                                    v
                                           MiMo TTS API
                                           (chat/completions)
```

- **API key safety** — injected server-side, never exposed to the client
- **No CORS issues** — proxy runs on the same domain
- **Zero cost** — Cloudflare Workers free tier (100k requests/day)

## Project Structure

```
MiMoTTS/
├── public/              # Static assets
├── src/
│   ├── api.ts           # TTS API client
│   ├── App.tsx          # Main app component
│   ├── App.css          # App styles
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── functions/
│   └── api/
│       └── tts.ts       # Cloudflare Pages Function (MiMo API proxy)
├── .env.example         # Environment variable template
├── package.json         # Project config
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config (with dev proxy)
└── wrangler.toml        # Cloudflare config
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MIMO_API_KEY` | Yes | — | MiMo platform API key |
| `MIMO_BASE_URL` | No | `https://token-plan-sgp.xiaomimimo.com/v1` | API base URL |

## Tech Stack

- **Frontend**: React 19 + TypeScript 6.0
- **Build**: Vite 8
- **Edge Runtime**: Cloudflare Pages Functions
- **Styling**: CSS Variables + responsive design

## Contributing

Issues and pull requests are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [Xiaomi MiMo Platform](https://platform.xiaomimimo.com) — TTS API provider
- [Cloudflare Pages](https://pages.cloudflare.com) — Edge deployment platform

## Links

- [MiMo TTS Documentation](https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5)
- [MiMo Platform](https://platform.xiaomimimo.com)
- [GitHub Repository](https://github.com/sergioperezcheco/MiMoTTS)

---

<div align="center">

**Built with care | Powered by Xiaomi MiMo-V2.5-TTS**

</div>
