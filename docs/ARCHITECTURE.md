# Vortix Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        npm Registry                          │
│                   (vortix package published)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ npm install -g vortix
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      User's Computer                         │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ CLI Commands │         │    Agent     │                 │
│  │              │         │              │                 │
│  │ vortix login │────────→│  agent.js    │                 │
│  │ vortix start │         │  auth.js     │                 │
│  │ vortix help  │         │              │                 │
│  └──────────────┘         └──────┬───────┘                 │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │
                                    │ WebSocket (WSS)
                                    │ Token: device-hostname
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server (Cloud)                    │
│                   Railway / Render / Heroku                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              WebSocket Server (port 8080)          │    │
│  │                                                     │    │
│  │  • Device Registry (Map<token, device>)           │    │
│  │  • Command Router                                  │    │
│  │  • AI Plan Generator (Ollama/OpenAI)              │    │
│  │  • Heartbeat Monitor                               │    │
│  │  • Log Broadcaster                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ WebSocket (WSS)
                           │ type=dashboard
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard (Vercel)                        │
│                      Next.js Web App                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  User Interface                     │    │
│  │                                                     │    │
│  │  • Device List (online/offline)                    │    │
│  │  • Command Input                                   │    │
│  │  • AI Plan Preview                                 │    │
│  │  • Execution Logs                                  │    │
│  │  • Real-time Updates                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Device Registration

```
Agent                Backend              Dashboard
  │                     │                     │
  │──── Connect ───────→│                     │
  │   (token=device-X)  │                     │
  │                     │                     │
  │←─── Accepted ──────│                     │
  │                     │                     │
  │                     │──── DEVICES ───────→│
  │                     │   (device list)     │
```

### 2. Command Execution (Manual)

```
Dashboard            Backend              Agent
    │                   │                   │
    │─── COMMAND ──────→│                   │
    │  {deviceName,     │                   │
    │   command}        │                   │
    │                   │                   │
    │                   │──── EXECUTE ─────→│
    │                   │   {command}       │
    │                   │                   │
    │                   │←─── LOG ──────────│
    │←─── LOG ──────────│   {output}        │
    │                   │                   │
    │                   │←─ EXECUTE_RESULT ─│
    │                   │   {code, output}  │
```

### 3. AI-Planned Execution

```
Dashboard            Backend              Agent
    │                   │                   │
    │──── PLAN ────────→│                   │
    │  {deviceName,     │                   │
    │   userRequest}    │                   │
    │                   │                   │
    │                   │ [Generate Plan]   │
    │                   │  via AI (Ollama)  │
    │                   │                   │
    │←─ PLAN_PREVIEW ───│                   │
    │  {steps[]}        │                   │
    │                   │                   │
    │─ APPROVE_PLAN ───→│                   │
    │  {steps[]}        │                   │
    │                   │                   │
    │                   │──── EXECUTE ─────→│ (step 1)
    │                   │←─ EXECUTE_RESULT ─│
    │                   │                   │
    │                   │──── EXECUTE ─────→│ (step 2)
    │                   │←─ EXECUTE_RESULT ─│
    │                   │                   │
    │                   │      ...          │
    │                   │                   │
    │← EXECUTION_FINISHED ─│                │
```

### 4. Heartbeat System

```
Agent                Backend
  │                     │
  │──── HEARTBEAT ─────→│ (every 5s)
  │                     │
  │                     │ [Update lastSeen]
  │                     │
  │                     │ [Monitor every 5s]
  │                     │ [Mark offline if >15s]
```

---

## Component Responsibilities

### CLI (`cli_vortix/bin/vortix.js`)

- Parse command-line arguments
- Route to agent or backend
- Provide help information

### Agent (`agent/agent.js`)

- Connect to backend via WebSocket
- Execute OS commands
- Send logs and results
- Maintain heartbeat
- Track current working directory

### Backend (`backend/server.js`)

- Accept WebSocket connections
- Authenticate devices
- Route messages
- Generate AI plans
- Monitor device health
- Broadcast device list

### Dashboard (`dashboard/app/page.tsx`)

- Display device list
- Send commands
- Show AI plan preview
- Display execution logs
- Real-time updates

---

## Message Types

### Agent → Backend

```javascript
{
	type: "HEARTBEAT";
}
{
	type: "LOG", deviceName, message;
}
{
	type: "EXECUTE_RESULT", command, code;
}
```

### Backend → Agent

```javascript
{
	type: "EXECUTE", command;
}
```

### Dashboard → Backend

```javascript
{
	type: "COMMAND", deviceName, command;
}
{
	type: "PLAN", deviceName, command;
}
{
	type: "APPROVE_PLAN", deviceName, steps;
}
{
	type: "FORCE_EXECUTE", deviceName, command;
}
```

### Backend → Dashboard

```javascript
{ type: "DEVICES", devices: [{deviceName, status}] }
{ type: "LOG", deviceName, message }
{ type: "PLAN_PREVIEW", deviceName, steps }
{ type: "EXECUTION_STARTED", deviceName }
{ type: "EXECUTION_FINISHED", deviceName, success/error }
```

---

## Security Model

### Current (Basic)

```
Token = "device-" + hostname.toLowerCase()
```

### Recommended (Production)

```
1. User registers → Gets JWT token
2. Agent authenticates with JWT
3. Backend validates JWT
4. Commands require user approval
5. Rate limiting per device
6. Command whitelist/blacklist
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           │                    │                    │
    ┌──────▼──────┐      ┌─────▼─────┐      ┌──────▼──────┐
    │   npm CDN   │      │  Railway  │      │   Vercel    │
    │             │      │           │      │             │
    │ vortix pkg  │      │  Backend  │      │  Dashboard  │
    │             │      │  (WSS)    │      │  (HTTPS)    │
    └─────────────┘      └───────────┘      └─────────────┘
```

---

## File Structure

```
vortix/
├── cli_vortix/              # npm package
│   ├── bin/
│   │   └── vortix.js        # CLI entry point
│   ├── package.json         # npm config
│   ├── README.md            # User docs
│   └── .npmignore           # Exclude files
│
├── agent/                   # Bundled with CLI
│   ├── agent.js             # Main agent
│   ├── auth.js              # Authentication
│   ├── config.json          # Config
│   └── package.json         # Dependencies
│
├── backend/                 # Deploy to cloud
│   ├── server.js            # WebSocket server
│   └── package.json         # Dependencies
│
├── dashboard/               # Deploy to Vercel
│   ├── app/
│   │   ├── page.tsx         # Main UI
│   │   └── layout.tsx       # Layout
│   ├── package.json         # Next.js config
│   └── .env.local           # Environment vars
│
└── docs/                    # Documentation
    ├── QUICK_START.md
    ├── DEPLOYMENT.md
    ├── CHECKLIST.md
    ├── SUMMARY.md
    └── ARCHITECTURE.md      # This file
```

---

## Technology Stack

### CLI & Agent

- Node.js
- WebSocket (ws)
- child_process (exec)

### Backend

- Node.js
- WebSocket Server (ws)
- Axios (HTTP client)
- Ollama/OpenAI (AI planning)

### Dashboard

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- WebSocket (native)

---

## Scaling Considerations

### Current Limits

- Single backend instance
- No load balancing
- In-memory device registry
- No persistence

### For Production

- Multiple backend instances
- Redis for shared state
- Database for device registry
- Load balancer (nginx)
- Message queue (RabbitMQ)
- Monitoring (Prometheus)

---

## Network Requirements

### Ports

- Backend: 8080 (WebSocket)
- Dashboard: 3000 (dev) / 443 (prod)

### Protocols

- Development: ws:// (WebSocket)
- Production: wss:// (WebSocket Secure)

### Firewall

- Agent → Backend: Outbound 8080
- Dashboard → Backend: Outbound 8080
- Users → Dashboard: Inbound 443

---

## Error Handling

### Agent

- Connection lost → Retry with backoff
- Command fails → Send error log
- Timeout → Report to backend

### Backend

- Device offline → Mark status
- Invalid message → Log and ignore
- AI planning fails → Notify dashboard

### Dashboard

- Connection lost → Show warning
- Command timeout → Show error
- No devices → Show empty state

---

## Monitoring Points

### Metrics to Track

- Active devices count
- Commands executed per hour
- Average command execution time
- Error rate
- WebSocket connection count
- AI plan generation time

### Logs to Collect

- Device connections/disconnections
- Command executions
- Errors and exceptions
- AI plan generations
- Authentication attempts

---

## Future Enhancements

1. **Multi-user support** - Multiple users, multiple devices
2. **Command history** - Store and replay commands
3. **Scheduled commands** - Cron-like scheduling
4. **File transfer** - Upload/download files
5. **Screen sharing** - View device screen
6. **Command templates** - Reusable command sets
7. **Webhooks** - Trigger external services
8. **API** - REST API for integrations

---

**This architecture supports the current implementation and provides a
foundation for future scaling.**
