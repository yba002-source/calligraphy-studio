# Calligraphy Studio

A web-based Islamic calligraphy design tool for creating social media ads.

## Features

- **Arabic text input** with RTL support
- **3 Arabic fonts**: Amiri, Noto Naskh, Scheherazade
- **Text color** picker with 8 preset colors
- **Font size** slider (24-200px)
- **Custom background** import (auto-scales to fit canvas)
- **Solid background colors** as fallback
- **Canvas size presets**: Square (1080×1080), Landscape (1920×1080), Story (1080×1920), X Post (1200×675)
- **PNG export** at full resolution
- **Links to ad platform guides**: X Ads, Meta Ads, YouTube Ads

## Tech Stack

- React 18 + Vite
- Fabric.js (canvas manipulation)
- Google Fonts (Arabic fonts)

## Getting Started

### On Replit

1. Import this repository from GitHub
2. Click "Run" — Replit will install dependencies and start the dev server
3. The app will open in a new tab

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deploying to Vercel

1. Connect your GitHub repo to Vercel
2. Vercel auto-detects Vite and deploys
3. Done — your app is live

## Roadmap (v2)

- Artistic style transformations (Tughra, Mirror, Geometric)
- Arabesque decorative frames
- Video export (MP4)
- More fonts

## License

MIT
