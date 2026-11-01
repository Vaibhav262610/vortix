# Vortix Backend

WebSocket server for coordinating devices and dashboard.

## Features

- WebSocket server for real-time communication
- Device registration and management
- Command routing between dashboard and agents
- AI-powered command planning (Ollama integration)
- Heartbeat monitoring

## Environment Variables

- `PORT` - Server port (default: 8080)
- `CLERK_SECRET_KEY` - Clerk secret key (`sk_test_...` or `sk_live_...`), from the same Clerk application as the dashboard
- `CLERK_JWT_KEY` - Optional Clerk JWT public key for local token verification (can be used instead of the secret key)
- `CLERK_AUTHORIZED_PARTIES` - Optional comma-separated dashboard origins (recommended in production)
- `GROQ_API_KEY` - Groq key used by AI planning; set this on the backend service in Render and redeploy

Copy `.env.example` to `.env` for local development. The active `server.js` loads this file. Dashboard connections must send an `AUTH_USER` message containing a Clerk session token before accessing devices. Device passwords are still required to unlock individual devices.

AI planning uses `openai/gpt-oss-120b` through Groq. The backend's `GROQ_API_KEY` takes precedence over a personal key saved in the dashboard's Settings page. Without a Groq key, Ollama is available only for local development.

## Local Development

```bash
# Install dependencies
npm install

# Start server
npm start
```

Server will run on `ws://localhost:8080`

## Deployment

### Railway

```bash
railway up
```

### Render

1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`

### Heroku

```bash
heroku create
git push heroku main
```

## API

### WebSocket Endpoints

**Agent Connection**

```
ws://backend-url?token=device-hostname:password
```

**Dashboard Connection**

```
ws://backend-url?type=dashboard
```

The dashboard must send `{ "type": "AUTH_USER", "token": "<Clerk session JWT>" }` after connecting.

## Message Types

See [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for complete message
documentation.

## Requirements

- Node.js >= 14.0.0
- Ollama running on localhost:11434 (for AI planning)

## Notes

- AI planning requires Ollama with qwen2.5:7b model
- Can be modified to use OpenAI instead
- Supports multiple simultaneous device connections
