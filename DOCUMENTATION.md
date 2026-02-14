# Vortix - AI-Powered Remote OS Control System

Complete documentation for the Vortix project - a remote OS control system with
AI-powered command generation.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Deployment](#deployment)
7. [Security](#security)
8. [Development](#development)
9. [Troubleshooting](#troubleshooting)
10. [Future Improvements](#future-improvements)

---

## Overview

Vortix is a remote OS control system that allows you to:

- Control multiple computers from a web dashboard
- Execute commands remotely via WebSocket
- Use AI to generate command sequences from natural language
- Secure devices with password authentication

### Tech Stack

- **CLI Agent**: Node.js, WebSocket
- **Backend**: Node.js, WebSocket Server, Groq API
- **Dashboard**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Deployment**:
  - CLI: npm registry
  - Backend: Render.com
  - Dashboard: Vercel

---

## Architecture

```
┌─────────────────┐
│   Dashboard     │ (Vercel)
│   Next.js App   │
└────────┬────────┘
         │ WebSocket
         │
┌────────▼────────┐
│   Backend       │ (Render)
│   WebSocket     │
│   Server        │
└────────┬────────┘
         │ WebSocket
         │
┌────────▼────────┐
│   CLI Agent     │ (User's PC)
│   Node.js       │
└─────────────────┘
```

### Communication Flow

1. **Agent → Backend**: Connects with `device-hostname:password` token
2. **Dashboard → Backend**: Connects as dashboard client
3. **Dashboard → Backend**: Authenticates to specific devices with password
4. **Dashboard → Backend**: Sends commands or AI prompts
5. **Backend → Agent**: Forwards commands for execution
6. **Agent → Backend**: Sends execution results and logs
7. **Backend → Dashboard**: Forwards logs to authenticated dashboards

---

## Features

### ✅ Implemented

1. **Device Management**
   - Auto-registration when agents connect
   - Password-based authentication
   - Online/Offline status tracking
   - Heartbeat monitoring

2. **Remote Command Execution**
   - Direct command execution
   - Real-time log streaming
   - Sequential command execution
   - Exit code tracking

3. **AI Command Generation**
   - Natural language to commands
   - Groq API integration (free tier)
   - Command preview before execution
   - Step-by-step execution

4. **Security**
   - Device password protection
   - SHA-256 password hashing
   - Per-session authentication
   - Locked device UI

5. **Dashboard Features**
   - Real-time device list
   - Online/Recent devices sections
   - Command input with AI planning
   - Live log viewer with auto-scroll
   - Settings page for API keys

### 🚧 In Development

- AI command reliability improvements
- Better error handling
- Command history
- Device grouping

---

## Installation

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- Windows OS (currently supported)

### Install CLI

```bash
npm install -g vortix
```

### Verify Installation

```bash
vortix help
```

---

## Usage

### 1. Set Device Password

On each device you want to control:

```bash
vortix login
```

Enter a secure password when prompted. This password will be required to access
the device from the dashboard.

### 2. Start Agent

```bash
vortix start
```

The agent will:

- Connect to the backend
- Register the device
- Start listening for commands

### 3. Access Dashboard

Open: https://vortixredeploy.vercel.app

### 4. Unlock Device

1. Click on your device in the sidebar
2. Enter the password you set with `vortix login`
3. Click "Unlock"

### 5. Send Commands

**Direct Commands:**

```
dir C:\Users\YourName\Desktop
echo Hello World > C:\Users\YourName\Desktop\test.txt
start notepad
```

**AI-Powered (experimental):**

```
create a hello.html file on desktop
show me all files in downloads folder
open calculator
```

---

## Deployment

### CLI Package (npm)

**Current Version**: 1.0.2

**Publish Updates:**

```bash
cd cli_vortix
npm version patch  # or minor, major
npm publish
```

**Package URL**: https://www.npmjs.com/package/vortix

### Backend (Render)

**URL**: https://vortix.onrender.com

**Auto-Deploy:**

- Pushes to `master` branch trigger automatic deployment
- Deployment takes ~2-3 minutes
- Free tier: sleeps after 15 minutes of inactivity

**Environment Variables:**

```
GROQ_API_KEY=your_groq_api_key_here
PORT=8080
```

**Manual Deploy:**

1. Push to GitHub
2. Render auto-detects changes
3. Builds and deploys automatically

### Dashboard (Vercel)

**URLs**:

- https://vortixredeploy.vercel.app
- https://vortix-ruddy.vercel.app

**Auto-Deploy:**

- Pushes to `master` branch trigger automatic deployment
- Deployment takes ~30-60 seconds

**Environment Variables:**

```
NEXT_PUBLIC_BACKEND_WS=wss://vortix.onrender.com
```

**Manual Deploy:**

```bash
cd dashboard
vercel --prod
```

---

## Security

### Password Protection

**How it works:**

1. User sets password with `vortix login`
2. Password stored locally in `~/.vortix-config.json`
3. Agent connects with token: `device-hostname:password`
4. Backend hashes password with SHA-256
5. Dashboard must provide correct password to unlock device

**Security Features:**

- ✅ Passwords never stored in plain text on backend
- ✅ SHA-256 hashing
- ✅ Per-session authentication
- ✅ No cross-device access without password
- ✅ Local password storage on agent PC

**Limitations:**

- ❌ No password recovery (must set new password)
- ❌ Session-based (re-authenticate each dashboard session)
- ❌ Memory storage (backend restart clears registrations)

### Best Practices

1. **Use Strong Passwords**: Minimum 8 characters, mix of letters/numbers
2. **Don't Share Passwords**: Each device should have unique password
3. **Secure Your PC**: Physical access = full control
4. **Monitor Logs**: Check dashboard logs for suspicious activity
5. **Update Regularly**: Keep CLI updated with `npm install -g vortix@latest`

---

## Development

### Project Structure

```
vortix/
├── agent/                  # Standalone agent (for development)
│   ├── agent.js
│   └── package.json
├── backend/                # WebSocket server
│   ├── server.js
│   └── package.json
├── cli_vortix/            # npm package
│   ├── bin/
│   │   └── vortix.js      # CLI entry point
│   ├── agent/
│   │   └── agent.js       # Agent code
│   └── package.json
├── dashboard/             # Next.js dashboard
│   ├── app/
│   │   ├── page.tsx       # Main dashboard
│   │   ├── setup/
│   │   ├── settings/
│   │   └── contact/
│   └── package.json
└── docs/                  # Documentation
```

### Local Development

**Backend:**

```bash
cd backend
npm install
node server.js
```

**Dashboard:**

```bash
cd dashboard
npm install
npm run dev
```

**Agent:**

```bash
cd agent
npm install
node agent.js
```

### Testing Changes

1. Make changes to code
2. Test locally
3. Commit to GitHub
4. Auto-deploys to Render/Vercel
5. Test on production

### Adding Features

**New Command Types:**

1. Add message type in backend `server.js`
2. Add handler in agent `agent.js`
3. Add UI in dashboard `page.tsx`

**New Dashboard Pages:**

1. Create in `dashboard/app/[page-name]/page.tsx`
2. Add navigation link in header
3. Deploy to Vercel

---

## Troubleshooting

### Agent Won't Connect

**Symptoms:**

- "Failed to start agent" error
- "Disconnected from backend" message

**Solutions:**

1. Check internet connection
2. Verify backend is running: https://vortix.onrender.com
3. Restart agent: `vortix start`
4. Reinstall CLI: `npm install -g vortix@latest`

### Device Shows as Locked

**Symptoms:**

- Device appears with lock icon
- Can't send commands

**Solutions:**

1. Click on device
2. Enter password (same as `vortix login`)
3. Click "Unlock"
4. If password forgotten, run `vortix login` again to set new password

### Unlock Button Not Working

**Symptoms:**

- Click "Unlock" but nothing happens
- Dialog doesn't close

**Solutions:**

1. Check browser console for errors (F12)
2. Verify correct password
3. Refresh dashboard (Ctrl+Shift+R)
4. Restart agent

### Duplicate Devices Showing

**Symptoms:**

- Same device appears multiple times
- Device name includes password

**Solutions:**

1. This was a bug in v1.0.1, fixed in v1.0.2
2. Update CLI: `npm install -g vortix@latest`
3. Restart agent
4. Refresh dashboard

### AI Commands Not Working

**Symptoms:**

- "AI planning error" message
- Commands don't execute

**Solutions:**

1. AI is experimental, use direct commands instead
2. Check Groq API key in Render environment variables
3. Try simpler prompts
4. Use direct Windows commands for reliability

### Backend Sleeping (Render Free Tier)

**Symptoms:**

- Agent can't connect
- Dashboard shows no devices
- First connection takes 30+ seconds

**Solutions:**

1. Wait 30-60 seconds for backend to wake up
2. Refresh dashboard
3. Agent will auto-reconnect
4. Consider upgrading Render plan for 24/7 uptime

---

## Future Improvements

### Short Term

- [ ] Fix AI command generation reliability
- [ ] Add command history in dashboard
- [ ] Remember authenticated devices in localStorage
- [ ] Add password change command
- [ ] Better error messages

### Medium Term

- [ ] Database integration (MongoDB)
- [ ] User accounts and authentication
- [ ] Device grouping/teams
- [ ] Scheduled commands
- [ ] Command templates

### Long Term

- [ ] Multi-platform support (macOS, Linux)
- [ ] Mobile app
- [ ] File transfer
- [ ] Screen sharing
- [ ] Webhooks and API
- [ ] Plugin system

---

## API Reference

### WebSocket Messages

**Agent → Backend:**

```javascript
// Heartbeat
{
  type: "HEARTBEAT"
}

// Log message
{
  type: "LOG",
  deviceName: "DEVICE-NAME",
  message: "log message"
}

// Execution result
{
  type: "EXECUTE_RESULT",
  command: "executed command",
  code: 0
}
```

**Dashboard → Backend:**

```javascript
// Authenticate device
{
  type: "AUTH_DEVICE",
  deviceName: "DEVICE-NAME",
  password: "device_password"
}

// Request AI plan
{
  type: "PLAN",
  deviceName: "DEVICE-NAME",
  command: "natural language command",
  apiKey: "optional_user_api_key"
}

// Approve and execute plan
{
  type: "APPROVE_PLAN",
  deviceName: "DEVICE-NAME",
  steps: [
    { command: "step 1" },
    { command: "step 2" }
  ]
}

// Force execute command
{
  type: "FORCE_EXECUTE",
  deviceName: "DEVICE-NAME",
  command: "direct command"
}
```

**Backend → Dashboard:**

```javascript
// Device list
{
  type: "DEVICES",
  devices: [
    {
      deviceName: "DEVICE-NAME",
      status: "online",
      authenticated: false
    }
  ]
}

// Authentication success
{
  type: "AUTH_SUCCESS",
  deviceName: "DEVICE-NAME"
}

// Authentication error
{
  type: "AUTH_ERROR",
  deviceName: "DEVICE-NAME",
  error: "error message"
}

// Plan preview
{
  type: "PLAN_PREVIEW",
  deviceName: "DEVICE-NAME",
  steps: [...]
}

// Execution started
{
  type: "EXECUTION_STARTED",
  deviceName: "DEVICE-NAME"
}

// Execution finished
{
  type: "EXECUTION_FINISHED",
  deviceName: "DEVICE-NAME",
  success: true
}

// Log message
{
  type: "LOG",
  deviceName: "DEVICE-NAME",
  message: "log message"
}
```

---

## Contact & Support

**Developer**: Vaibhav Rajpoot **Email**: vaibhavrajpoot2626@gmail.com
**Portfolio**: https://vaibhavrajpoot.vercel.app **GitHub**:
https://github.com/Vaibhav262610/vortix

**Links:**

- Dashboard: https://vortixredeploy.vercel.app
- Backend: https://vortix.onrender.com
- npm Package: https://www.npmjs.com/package/vortix
- Setup Guide: https://vortixredeploy.vercel.app/setup

---

## License

MIT License - Free to use and modify

---

## Changelog

### v1.0.2 (Current)

- ✅ Added device password authentication
- ✅ Fixed duplicate device registration
- ✅ Fixed unlock button functionality
- ✅ Added online/recent devices sections
- ✅ Improved dashboard UI

### v1.0.1

- ✅ Initial npm release
- ✅ Basic remote command execution
- ✅ AI command generation
- ✅ Dashboard deployment

### v1.0.0

- ✅ Initial development version
- ✅ Core functionality

---

**Last Updated**: February 14, 2026 **Version**: 1.0.2 **Status**: Active
Development
