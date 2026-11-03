# Vortix backend

`server.js` is the active WebSocket and HTTP server. Use Node.js 20.19+, 22.12+, or 24+.

## Configuration

Copy `.env.example` to `.env` for local development. Set `CLERK_SECRET_KEY` from the same Clerk application as the dashboard. `CLERK_AUTHORIZED_PARTIES` should list allowed dashboard origins. Set `GROQ_API_KEY` on the backend for AI planning.

For production, set `DATABASE_URL` to a PostgreSQL connection string. The server creates device, pairing, authentication-attempt, and command tables at startup. Without `DATABASE_URL`, it saves to `backend/data/state.json`, or `VORTIX_DATA_FILE` if set. A local file is suitable for one process; Render's default filesystem is ephemeral, so configure PostgreSQL there. On Render web services, IP limits use the edge-set `CF-Connecting-IP` header; elsewhere they use the socket address.

## Run

```bash
npm ci
npm start
```

Run `npm test` for authentication, ownership, and planning tests. The health endpoint is `GET /health`.

## Access model

- The dashboard signs in with Clerk and sends a session token to the WebSocket server.
- A new agent registers only with a one-time pairing code from an authenticated dashboard, sent in `X-Vortix-Pairing`. Registration binds it to that account. The server stores a salted device password hash. Use `wss://` outside local development.
- Existing registered agents continue to reconnect with their saved password. A legacy unclaimed device can still be claimed once by presenting its name and password in the dashboard.
- Failed device-password attempts are limited per device and network address for five minutes. Pairing-code creation is limited per account and address.
- Later dashboard connections restore access from the verified Clerk account and stored ownership.
- AI plans are held on the server for five minutes. The dashboard approves by plan ID; it cannot substitute commands in the approval message.
- `GET /api/history` and `GET /api/stats` require `Authorization: Bearer <Clerk session token>` and only return the authenticated user's records.

The backend can send commands to online agents; deploy it and protect its credentials accordingly. See [SECURITY.md](../SECURITY.md).
