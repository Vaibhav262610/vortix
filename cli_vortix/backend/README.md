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
ws://backend-url?token=device-hostname
```

**Dashboard Connection**

```
ws://backend-url?type=dashboard
```

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
