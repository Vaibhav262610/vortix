# Security

Vortix runs commands on a device where its agent is installed. Install it only on a computer you own or administer. Do not run it as an administrator or root user.

## Current controls

- The dashboard authenticates a Clerk session before device operations. Device data is scoped to its owner.
- A new agent needs a one-time, 10-minute pairing code created by a signed-in account. The code is stored as a SHA256 digest and consumed atomically with registration. New device names include a random suffix.
- An older unclaimed device record can still be claimed with its name and password. Pair that installation with a new code to move it to a random identity; legacy records are not automatically removed.
- Existing device passwords are hashed with scrypt on the backend. Failed attempts are counted per device and network address, with a five-minute lockout. Counters persist in PostgreSQL when `DATABASE_URL` is set.
- The agent sends credentials in WebSocket headers. Hosted connections must use TLS (`wss://`); local development may use `ws://localhost`.
- The local tray can pause or quit the agent. Approved AI goals are bounded by step count, and Discord message workflows check the visible recipient and draft.
- Rescue Autopilot is off by default. When enabled, it stores read-only scan summaries that include folder paths, file paths, and sizes. The dashboard owner can clear those summaries. File and PostgreSQL modes keep the newest 20 snapshots per device.
- Discord workflow checkpoints store the recipient and message for up to 24 hours so an unsent request can be reviewed after reconnecting. A restart during sending marks delivery uncertain and never automatically sends it again.

## Trust boundary

The backend can send shell commands and desktop actions to an online agent. If the backend or an owner account is compromised, an attacker could use that capability. AI planning approval and screen checks reduce accidental actions; they do not make a compromised backend safe. The dashboard also offers direct shell execution. Use a low-privilege OS account, keep OS and Node.js updated, and pause the agent when remote access is unnecessary.

The device password remains in the local user's `.vortix-config.json` file. The agent writes this file with user-only mode on platforms that honor Unix file modes; Windows access follows the user's profile ACL. Vortix does not currently provide end-to-end encryption from dashboard to agent, independent of the backend. Do not describe it as such.

Only deploy the backend behind a trusted reverse proxy. On Render web services, rate limits use the edge-set `CF-Connecting-IP` value. Other deployments use the socket address until their proxy is explicitly reviewed. `X-Forwarded-For` is ignored because a client can inject its first value. Configure `CLERK_AUTHORIZED_PARTIES` for your dashboard origins. Keep `DATABASE_URL`, Clerk keys, and `GROQ_API_KEY` out of Git.

## Report a vulnerability

Open a private [GitHub security advisory](https://github.com/Vaibhav262610/vortix/security/advisories/new). Include affected version, reproduction steps, and impact. Avoid posting working exploits or credentials in a public issue.

No software can guarantee 100% security. See [ROADMAP.md](ROADMAP.md) for work that remains.
