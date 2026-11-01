# Vortix

Vortix is a remote device control project with a Next.js dashboard, a WebSocket backend, and a device agent. The dashboard uses Clerk for account sign-in. A separate device password unlocks each connected agent.

## Local setup (PowerShell)

Use Node.js 20.19+, 22.12+, or 24+.

1. In `backend`, run `npm ci`, copy `.env.example` to `.env`, and replace `CLERK_SECRET_KEY` with the secret key from your Clerk application. Run `npm start`.
2. In `dashboard`, run `npm ci`, copy `.env.example` to `.env.local`, and set the publishable and secret keys from the **same Clerk application**. For a local backend, set `NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080`. Run `npm run dev`.
3. In `agent`, run `npm ci` and `node agent.js login` to set a device password. In the same PowerShell session, run `$env:BACKEND_URL='ws://localhost:8080'` and then `node agent.js start`.
4. Open `http://localhost:3000/sign-up` to create an account, or `/auth` to sign in. Open `/dashboard`, choose the connected device, and enter its device password.

The deployed dashboard and backend need the same Clerk application configuration. Set the backend's `CLERK_SECRET_KEY` (or `CLERK_JWT_KEY`) and redeploy it when updating the dashboard auth flow. `CLERK_AUTHORIZED_PARTIES` can restrict accepted session tokens to your dashboard origins.

## Project layout

| Directory | Purpose |
| --- | --- |
| `dashboard/` | Next.js UI and Clerk account flow |
| `backend/` | Active WebSocket server (`server.js`) |
| `agent/` | Device agent |
| `cli_vortix/` | Packaged CLI and copies of agent/backend code |

## Current limitations

The active backend keeps devices in memory. Its `server-with-db.js` file is an unfinished prototype and is not started by `npm start`. The dashboard's `/api/history` and `/api/stats` routes currently target endpoints absent from the active backend, so persistent command history and statistics are not available yet. Avoid relying on those features until the database backend is finished.

Run `npm test` in `backend` for WebSocket authentication checks and `npm run build` in `dashboard` for a production build.
