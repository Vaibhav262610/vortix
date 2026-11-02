# Vortix

Vortix is a remote device control project with a Next.js dashboard, a WebSocket backend, and a device agent. The dashboard uses Clerk for account sign-in. A separate device password unlocks each connected agent.

Storage Rescue can scan common user folders or accessible drives on an online device and lists large files and folders. It is read-only and bounded per drive, so large drives may show partial results. Windows system folders are skipped. The owner can open a result in the file browser. Update the agent and backend together to use it.

The npm registry currently serves `vortix@1.2.3`. If the device runs `vortix start` from a global npm installation, stop that process, clone or pull this repository on the device, then run `cd cli_vortix`, `npm pack`, `npm install -g ./vortix-1.2.8.tgz`, and `vortix start` in sequence. This installs the local CLI package version 1.2.8 and reads the existing password stored in that user's home directory. The dashboard shows an update notice when an older agent connects.

The dashboard puts voice commands first. Press **Speak a command**, talk for up to 20 seconds, then press **Stop and send voice**. The backend transcribes the recording with Groq Whisper; the recognized command follows the same plan or message-preview flow as typed commands. Vortix speaks short status replies when browser speech synthesis is available. Typed commands remain available. Recordings are processed in memory and are not saved to command history.

On Windows, a request such as “open Discord and message claveb07 hello” uses a screen-aware workflow. After the user reviews the exact recipient and message and clicks **Send this message**, the agent captures only the Discord window, locates the highlighted individual result, opens it, checks the account username, focuses the composer, drafts the message, and checks it before sending. The backend observes the result of each step and can wait or retry a failed selection within a fixed step limit. It stops if the recipient or draft cannot be verified. Screenshots are not saved to command history. Discord is the first supported app workflow; other applications need their own action and verification rules.

## Local setup (PowerShell)

Use Node.js 20.19+, 22.12+, or 24+.

1. In `backend`, run `npm ci`, copy `.env.example` to `.env`, and replace `CLERK_SECRET_KEY` with the secret key from your Clerk application. Run `npm start`.
2. In `dashboard`, run `npm ci`, copy `.env.example` to `.env.local`, and set the publishable and secret keys from the **same Clerk application**. For a local backend, set `NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080`. Run `npm run dev`.
3. In `agent`, run `npm ci` and `node agent.js login` to set a device password. In the same PowerShell session, run `$env:BACKEND_URL='ws://localhost:8080'` and then `node agent.js start`.
4. Open `http://localhost:3000/sign-up` to create an account, or `/auth` to sign in. Open `/dashboard`, click **Add device**, and enter the agent computer name and its device password. The first account to add a device becomes its owner; later visits restore that account's access automatically.

The deployed dashboard and backend need the same Clerk application configuration. Set the backend's `CLERK_SECRET_KEY` (or `CLERK_JWT_KEY`) and redeploy it when updating the dashboard auth flow. `CLERK_AUTHORIZED_PARTIES` can restrict accepted session tokens to your dashboard origins.

Set `DATABASE_URL` to a PostgreSQL database for the deployed backend. Without it, the backend writes to `backend/data/state.json`; that file survives a process restart but not replacement of an ephemeral Render instance. Keep your database or data file when redeploying, because it contains device ownership and password hashes. AI planning reads `GROQ_API_KEY` only on the backend.

## Project layout

| Directory | Purpose |
| --- | --- |
| `dashboard/` | Next.js UI and Clerk account flow |
| `backend/` | Active WebSocket server (`server.js`) |
| `agent/` | Device agent |
| `cli_vortix/` | Packaged CLI and copies of agent/backend code |

## Current limitations

Live connections and pending AI plans are held in memory. Device ownership and command outcomes persist in PostgreSQL when `DATABASE_URL` is configured, or in a local JSON file otherwise. The local file mode is intended for one backend process and caps stored command history at 2,000 entries. Device names are currently unique across the whole backend; choose a distinct name for each agent. The packaged CLI under `cli_vortix/` still includes a legacy backend copy; deploy `backend/server.js` for the ownership and history features.

Run `npm test` in `backend` for WebSocket authentication checks and `npm run build` in `dashboard` for a production build.
