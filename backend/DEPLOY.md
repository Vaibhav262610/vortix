# Deploy the Vortix backend on Render

The active service is `backend/server.js`. Set the Render web service root directory to `backend`, the build command to `npm ci`, and the start command to `npm start`.

## Environment

Set these values on the backend service:

| Variable | Purpose |
| --- | --- |
| `CLERK_SECRET_KEY` | Secret key from the same Clerk application as the dashboard |
| `CLERK_AUTHORIZED_PARTIES` | Comma-separated dashboard origins, such as `https://your-dashboard.example` |
| `GROQ_API_KEY` | Server-side AI planning key |
| `DATABASE_URL` | PostgreSQL connection URL for persistent ownership and command history |

Render supplies `PORT`. Do not place these secrets in `NEXT_PUBLIC_` dashboard variables. The dashboard needs `NEXT_PUBLIC_BACKEND_WS=wss://YOUR-BACKEND-HOST` and the Clerk publishable and secret keys for its own service.

Create a PostgreSQL database and use its [internal URL](https://render.com/docs/postgresql-creating-connecting) for `DATABASE_URL` when the database and web service are in the same Render region. Render's [default web service filesystem is ephemeral](https://render.com/docs/disks), so the backend's file mode will lose ownership and history after a restart or redeploy. The backend creates its tables on startup.

After deploying, open `https://YOUR-BACKEND-HOST/health` and confirm `"status":"ok"` and `"persistence":"postgres"`. Sign in to the dashboard, open **Add device**, and create a pairing code. Enter that code in the Windows tray app or run `vortix pair` on the device. The code expires after ten minutes and binds the new device to your account. Returning to the dashboard with the same Clerk account restores access without entering the device password again.

Agent connections should use `wss://`. Current agents send the device credential in the WebSocket authorization header. Older agents using a URL token still connect for compatibility; update them when practical.

New installations get a random suffix in their device name, avoiding predictable global names. Existing owned devices reconnect with their saved password. Use a new pairing code for an older unclaimed installation to move it to a random identity.
