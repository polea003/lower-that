# Lower That: Codebase Overview

## Purpose

Lower That mutes or unmutes a Samsung TV based on what a webcam sees. The web app captures frames every 5 seconds, the server sends the image to an OpenAI vision model, and the server toggles TV mute based on the model result.

## High-level architecture

- Web client (Vite + React + MUI + Tailwind)
  - Captures webcam frames, sends them to the API, shows results.
- API server (Express)
  - Accepts image input, calls OpenAI, decides whether to mute/unmute.
  - Optionally controls Samsung TV via `samsung-tv-remote`.

## Data flow (happy path)

1. `web/src/App.tsx` captures a frame from the webcam every 5s.
2. `web/src/api/client.ts` posts multipart form data to `POST /api/analyze`.
3. `server/src/http/routes/analyze.js` reads the image, calls `visionAnalysisService`.
4. `server/src/services/visionAnalysisService.js` sends the image to OpenAI and returns JSON.
5. `server/src/http/routes/analyze.js` compares `should_mute_tv` with server state and toggles mute if needed.

## Where the Samsung TV logic lives (and how to swap it)

The Samsung-specific code is isolated in the server services and environment config so it can be replaced cleanly.

- **Samsung implementation**: `server/src/services/tvRemoteService.js`
  - Uses `samsung-tv-remote` and depends on `SAMSUNG_TV_IP_ADDRESS` and `SAMSUNG_TV_MAC_ADDRESS`.
  - Exposes `toggleMute()` and `wakeUp()`.
- **No-op implementation**: `server/src/services/tvRemoteNoopService.js`
  - Used when TV control is disabled; same public methods, but logs instead of sending commands.
- **Wiring / DI**: `server/src/server.js`
  - Chooses between real vs no-op service based on `environment.tvControlEnabled`.
- **Route usage**: `server/src/http/routes/analyze.js`
  - Calls `tvRemoteService.toggleMute()`; does not know or care which TV backend it is.
- **Env config**: `server/src/config/environment.js` and `env.example`
  - Validates TV env vars and maps them to `environment.samsung`.

### Replacing Samsung with Apple TV (recommended path)

1. **Create a new service module** (e.g. `server/src/services/appleTvRemoteService.js`) that exports the same interface:
   - `toggleMute()` and `wakeUp()` methods.
   - Keep the same error handling pattern as `tvRemoteService.js`.
2. **Update environment config** to include Apple TV config keys, plus any validation:
   - Edit `server/src/config/environment.js` and `env.example`.
3. **Swap the wiring** in `server/src/server.js`:
   - Replace `tvRemoteService` import with `appleTvRemoteService`.
   - Keep the no-op service path intact for dry runs.
4. **(Optional) Keep Samsung as a selectable backend**:
   - Add a `TV_PROVIDER` env var (e.g. `samsung|apple`).
   - Switch in `server/src/server.js` based on provider.

### Things that are already TV-agnostic

- `server/src/http/routes/analyze.js` only calls `toggleMute()`; it does not know the vendor.
- `web/` does not know about TV control at all.

## Server layout

- Entry: `server/src/server.js`
- Express app: `server/src/http/app.js`
- Route: `server/src/http/routes/analyze.js`
- OpenAI integration: `server/src/services/visionAnalysisService.js`
- TV control: `server/src/services/tvRemoteService.js`
- No-op TV control: `server/src/services/tvRemoteNoopService.js`
- Env config: `server/src/config/environment.js`
- Defaults/constants: `server/src/config/constants.js`
- Logger: `server/src/utils/logger.js`

## Web layout

- App UI: `web/src/App.tsx`
- API client: `web/src/api/client.ts`
- Styles: `web/src/index.css`
- Tests: `web/tests/*` and `web/e2e/*`

## Configuration and env vars

- `env.example` documents required values.
- Required: `OPENAI_API_KEY`.
- TV control: `TV_CONTROL_ENABLED`, `SAMSUNG_TV_IP_ADDRESS`, `SAMSUNG_TV_MAC_ADDRESS`.
- Logging: `LOG_LEVEL`.

## Testing

- Server: `cd server && npm test` (Vitest + Supertest).
- Web unit: `cd web && npm test` (Vitest + RTL + MSW).
- Web e2e: `cd web && npm run e2e` (Playwright).

## Docker

- `docker-compose.yml` runs `server` and `web` together.
- `server/Dockerfile` builds production API image.
- `web/Dockerfile` runs Vite dev server in a container.

## Notes for future agents

- The server keeps mute state in memory; restarts reset it.
- Mute uses a toggle key, so state drift can lead to inversions.
- TV control can be disabled; the no-op service logs actions instead.
