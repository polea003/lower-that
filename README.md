# 📺 Lower That

Mute/unmute your Samsung TV based on what your webcam sees. The web app captures an image every 5 seconds, the server analyzes it with an OpenAI vision model, and the server decides whether to toggle mute.

## Quickstart (Docker)

Use Docker Compose to run both services: the Express API and the web app.

Quick start:

```bash
# from repo root
# Use the provided example to create your Compose env file
cp env.example .env

# Edit .env and set your values (at minimum OPENAI_API_KEY).
# If enabling TV control, set TV_CONTROL_ENABLED=true and provide
# SAMSUNG_TV_IP_ADDRESS and SAMSUNG_TV_MAC_ADDRESS.

docker compose up -d --build
```

Once containers are running, access the app at `http://localhost:5173`

## Overview

- Web client (Vite + React + Tailwind + MUI) shows the webcam, lets you set a preferred content description, and streams snapshots to the server.
- Server (Express) exposes `POST /api/analyze`; it calls the OpenAI API and controls your TV.
- Testing is set up end-to-end: Vitest + RTL + MSW on the web, and Vitest + Supertest on the server.

## Architecture

- `server/`: Express API
  - `src/server.js`: entry point
  - `src/http/app.js`: Express app wiring
  - `src/http/routes/analyze.js`: `POST /api/analyze` (multipart or JSON base64)
  - `src/services/visionAnalysisService.js`: OpenAI integration
  - `src/services/tvRemoteService.js`: Samsung TV control
  - `src/services/tvRemoteNoopService.js`: no-op TV control (for dry runs)
  - `src/config/environment.js`: env parsing/validation
  - `src/utils/logger.js`: structured logging
- `web/`: Vite React app
  - `src/App.tsx`: single-page UI (webcam, input, last image, results log)
  - `src/api/client.ts`: client for `/api/analyze`
  - `vite.config.ts`: dev proxy `/api` → target from `VITE_API_PROXY_TARGET` (defaults to `http://localhost:3000`)


## Setup (development)

### 1) Server configuration

```bash
cd server
cp env.example .env
```

Edit `.env` with your values:

```env
OPENAI_API_KEY=your_openai_api_key
SAMSUNG_TV_IP_ADDRESS=your_tv_ip
SAMSUNG_TV_MAC_ADDRESS=your_tv_mac

# Optional: disable real TV control (dry run)
TV_CONTROL_ENABLED=true

# Optional: logging level (info, debug, warn, error)
LOG_LEVEL=info
```

Notes:
- Samsung IP/MAC are required when `TV_CONTROL_ENABLED=true`.
- With `TV_CONTROL_ENABLED=false`, the server analyzes but does not send TV commands.

Install dependencies:

```bash
cd server
npm install
```

Run the API:

```bash
npm start
# http://localhost:3000
```

### 2) Web client

Install deps and run dev server:

```bash
cd web
npm install
npm run dev
# http://localhost:5173 (proxies /api to :3000)
```

The page:
- Shows live webcam
- Lets you set your preferred content description
- Captures a JPEG every 5s and posts to `/api/analyze`
- Displays the last capture and a rolling results log

### 3) Testing

- Server: `cd server && npm test` (Vitest + Supertest; coverage enabled)
- Web (unit): `cd web && npm test` (Vitest + RTL + MSW; coverage enabled)
- Web (e2e): `cd web && npx playwright install && npm run e2e`

 

## Notes

- OpenAI calls incur cost; monitor usage.
- Webcam captures include your environment; handle artifacts and logs securely.
- The server applies mute logic on every analysis request — the client does not need to manage TV state.

## Contributing

PRs welcome! Please include:
- Rationale and scope of changes
- Testing steps and logs (use `LOG_LEVEL=debug` where helpful)
- Any env var changes (update `env.example`)
