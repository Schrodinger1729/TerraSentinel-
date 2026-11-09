# HIM-SHIELD

HIM-SHIELD is a responsive disaster-intelligence website concept for Himalayan landslide monitoring and infrastructure awareness. Its reports and workspace preferences are backed by a small local HTTP API with JSON-file persistence. Risk, weather, analytics, and map values remain illustrative demo data; there is no machine-learning model, live weather or sensor feed, or emergency notification service.

## Run locally

Requirements: Node.js 20+ and npm.

```powershell
npm.cmd install
npm.cmd run dev
```

`npm run dev` starts both the Vite frontend and the API. Open the local URL printed by Vite (usually `http://127.0.0.1:5173`). The API listens on `127.0.0.1:3001` in development. Set `API_PORT` to change its port; Vite's API proxy follows that setting.

The backend creates `server/data/store.json` on first start and persists incident reports, status changes, and settings there. That runtime data file is git-ignored.

## Deploy a combined frontend and API

Use a Node.js host that can run a long-lived server (not a static-only host such as GitHub Pages). Use Node.js 20 or newer, run `npm ci && npm run build` as the build command, and `npm start` as the start command. The server serves the built frontend and API from the same origin. On a host that provides `PORT`, it binds to `0.0.0.0` and uses that port unless `API_PORT` is set. Locally it binds to `127.0.0.1` by default.

Configure `API_DATA_FILE` to a file on the host's persistent disk (for example, `/var/data/store.json` where supported). Without persistent storage, the host may discard reports and settings on restart or redeploy. The default `server/data/store.json` is suitable only for local development.

## Access control and secrets

The workspace now requires a shared access password to view data or use the app. It uses an HTTP-only, same-site session cookie, CSRF tokens for changes, a 12-hour session, and a limit of 10 failed sign-ins per client address per 15 minutes. This is a private shared-password gate, not individual accounts: every signed-in visitor has the same access, and there are no user roles or audit trail.

Set `APP_PASSWORD` to a unique password with at least 12 characters and `SESSION_SECRET` to a randomly generated secret with at least 32 bytes. In production, the server refuses to start if either value is missing or too short. Generate secrets with PowerShell:

```powershell
$env:APP_PASSWORD = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:SESSION_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Set these as private environment variables in the hosting provider; never commit them. For local `npm run dev`, the server generates a temporary password and prints it in the server terminal if `APP_PASSWORD` is not set. A temporary session secret is also generated when needed.

Deploy behind HTTPS so production's `Secure` session cookie can be used. Sign-in limits use the client address from the socket by default. If your trusted hosting proxy forwards `X-Forwarded-For`, set `TRUST_PROXY_HOPS` to the number of trusted proxy hops so limits can distinguish clients; only do this when direct traffic cannot bypass that proxy. Otherwise, visitors behind the same proxy may share a rate limit.

The login gate is suitable for a private demo, not sensitive or operational data: the password is shared, there is no account recovery or per-user access, and sign-in limits and sessions are in-memory. Run a single application instance; this demo's JSON-file storage and in-memory sessions are not designed for multi-instance scaling. Anyone with the password can view and change all workspace data. Do not publish the password or use this as an emergency-response system.

For frontend-only work, `npm run dev:client` runs Vite and `npm run dev:server` runs the API separately. `npm run preview` previews only the built frontend; run the API separately as well if testing its `/api` requests. To create and preview the full application locally, use:

```powershell
npm.cmd run build
npm.cmd start
```

The full app is then available at `http://localhost:3001` (or the configured port). Authentication endpoints:

- `GET /api/auth/session`
- `POST /api/auth/login`
- `POST /api/auth/logout`

The health endpoint is public; incident and settings endpoints require a signed-in session and CSRF token for writes:

- `GET /api/health`
- `GET /api/incidents`, `POST /api/incidents`
- `PATCH /api/incidents/:id/status`
- `GET /api/settings`, `PUT /api/settings`

The map uses CARTO dark basemap tiles with OpenStreetMap attribution and needs an internet connection. If tiles cannot load, sample locations and risk details remain available.

## Application structure

```text
src/
  components/
    AppShell.tsx       Navigation, header, page search, and shared layout
    UI.tsx             Reusable panels, metrics, badges, and demo notice
  data/
    api.ts             Frontend API client
    demo.ts            Clearly illustrative sample records and chart series
  pages/
    Overview.tsx       Regional dashboard
    MapPage.tsx        Interactive Kashmir map and sample locations
    RiskPage.tsx       Risk classification table and filters
    WeatherPage.tsx    Sample rainfall visualization and outlook
    ReportPage.tsx     Interactive local demo incident form
    IncidentsPage.tsx  Searchable incident register and status updates
    AnalyticsPage.tsx  Sample charts and reporting summaries
    SettingsPage.tsx   Local interface preferences
  App.tsx              Routes, backend state, loading, and error boundary
  index.css            Theme, responsive layout, and component styles
  main.tsx             React entry point
server/
  index.mjs            Password-protected API, static serving, and persistence
```

Risk labels, weather values, locations, and incident records are illustrative only; they are not verified conditions, forecasts, official warnings, or emergency instructions.
