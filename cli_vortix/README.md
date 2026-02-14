# Vortix

AI-powered OS control system with remote command execution capabilities.

## Installation

```bash
npm install -g vortix
```

## Quick Start

### 1. Start Backend Server

```bash
vortix backend
```

### 2. Login Device (on target machine)

```bash
vortix login
```

### 3. Start Agent (on target machine)

```bash
vortix start
```

## Commands

- `vortix login` - Authenticate and register device
- `vortix start` - Start the agent on current machine
- `vortix backend` - Start the backend WebSocket server
- `vortix help` - Show help information

## Architecture

- **Backend**: WebSocket server (port 8080) for device coordination
- **Agent**: Runs on target machines, executes commands
- **Dashboard**: Web UI for managing devices (separate deployment)

## Requirements

- Node.js >= 14.0.0
- Network access between backend and agents

## License

MIT
