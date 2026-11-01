# Vortix backend

`server.js` is the active WebSocket and HTTP server. Use Node.js 20.19+, 22.12+, or 24+.

## Configuration

Copy `.env.example` to `.env` for local development. Set `CLERK_SECRET_KEY` from the same Clerk application as the dashboard. `CLERK_AUTHORIZED_PARTIES` should list allowed dashboard origins. Set `GROQ_API_KEY` on the backend for AI planning.

For production, set `DATABASE_URL` to a PostgreSQL connection string. The server creates its device and command tables at startup. Without `DATABASE_URL`, it saves to `backend/data/state.json`, or `VORTIX_DATA_FILE` if set. A local file is suitable for one process; Render's default filesystem is ephemeral, so configure PostgreSQL there.

## Run

```bash
npm ci
npm start
```

Run `npm test` for authentication, ownership, and planning tests. The health endpoint is `GET /health`.

## Access model

- The dashboard signs in with Clerk and sends a session token to the WebSocket server.
- An agent registers using its device name and password in the WebSocket `Authorization` header. Use `wss://` outside local development. The server stores a salted password hash. The legacy URL token format remains accepted for older agents; update those agents before removing that compatibility path.
- The first Clerk account to add a device with its name and password becomes its owner. Other accounts cannot see or unlock it.
- The device password is needed when an account first adds the device. Later dashboard connections restore access from the verified Clerk account and stored ownership.
- AI plans are held on the server for five minutes. The dashboard approves by plan ID; it cannot substitute commands in the approval message.
- `GET /api/history` and `GET /api/stats` require `Authorization: Bearer <Clerk session token>` and only return the authenticated user's records.

Agent passwords and ownership created by older in-memory versions cannot be migrated automatically. On first run with this version, reconnect the agent and add it from the intended account.
