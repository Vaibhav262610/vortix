# Vortix - Remote OS Control System

A powerful remote control system for managing devices from anywhere. Control
your computer, execute commands, transfer files, and monitor system stats in
real-time through a beautiful web dashboard.

## 🚀 Features

- **Remote Command Execution** - Execute shell commands on remote devices
- **Real-Time System Monitoring** - CPU, Memory, and Disk usage
- **File Transfer** - Upload and download files between devices
- **Screen Sharing** - View remote device screens in real-time
- **Multi-Device Control** - Execute commands on multiple devices simultaneously
- **Auto-Start** - Automatically start agent on system boot
- **Dark/Light Theme** - Beautiful UI with theme toggle
- **Secure Authentication** - Password-protected device access
- **Cross-Platform** - Works on Windows, macOS, and Linux

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🏃 Quick Start (Local Development)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/vortix.git
cd vortix
```

### 2. Start Backend

```bash
cd backend
npm install
npm start
```

### 3. Start Agent

```bash
cd agent
npm install
node agent.js login  # Set password (e.g., vortix123)
node agent.js start
```

### 4. Start Dashboard

```bash
cd dashboard
npm install
npm run dev
```

### 5. Open Dashboard

```
http://localhost:3000/dashboard
```

## 🌐 Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment
instructions.

### Quick Deploy to Render.com

#### Backend

1. Create new Web Service
2. Connect GitHub repository
3. Root directory: `backend`
4. Build: `npm install`
5. Start: `npm start`

#### Dashboard

1. Create new Static Site
2. Connect GitHub repository
3. Root directory: `dashboard`
4. Build: `npm install && npm run build`
5. Environment: `NEXT_PUBLIC_BACKEND_WS=wss://your-backend-url.onrender.com`

## 📱 Agent Setup

### Windows

```bash
cd agent
node agent.js login
node agent.js start
node agent.js enable-autostart  # Optional: Start on boot
```

### macOS/Linux

```bash
cd agent
node agent.js login
node agent.js start
node agent.js enable-autostart  # Optional: Start on boot
```

## 🔧 Configuration

### Dashboard (.env.local)

```env
NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080  # Local
# NEXT_PUBLIC_BACKEND_WS=wss://your-backend.com  # Production
```

### Agent

```bash
# Local
node agent.js start

# Production
export BACKEND_URL=wss://your-backend.com
node agent.js start
```

## 📖 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [WebSocket Connection Fix](WEBSOCKET_CONNECTION_FIX.md) - Troubleshooting
  guide
- [System Stats Verification](SYSTEM_STATS_VERIFICATION.md) - Testing guide
- [Device Password Info](DEVICE_PASSWORD_INFO.md) - Password management

## 🎯 Usage

### Dashboard

1. **Connect Device**
   - Open dashboard
   - Click on your device
   - Enter password
   - Device is now connected

2. **Execute Commands**
   - Type command in input box
   - Press Ctrl+Enter or click Execute
   - View output in logs section

3. **Monitor System Stats**
   - View real-time stats in right sidebar
   - CPU, Memory, and Disk usage
   - Updates every 3 seconds

4. **Transfer Files**
   - Click blue folder icon (bottom left)
   - Browse remote files
   - Upload/download files

5. **Multi-Device Control**
   - Click purple devices icon (bottom left)
   - Select multiple devices
   - Execute command on all at once

### Agent Commands

```bash
node agent.js login              # Set device password
node agent.js start              # Start agent
node agent.js enable-autostart   # Enable auto-start on boot
node agent.js disable-autostart  # Disable auto-start
node agent.js status             # Check auto-start status
```

## 🔐 Security

- **Password Protection** - Each device requires password authentication
- **Secure WebSocket** - Use WSS (WebSocket Secure) in production
- **No Data Storage** - Commands and data are not stored on backend
- **Local Config** - Passwords stored locally on each device

## 🛠️ Development

### Project Structure

```
vortix/
├── backend/          # WebSocket server
│   ├── server.js     # Main server file
│   └── package.json
├── dashboard/        # Next.js web interface
│   ├── app/          # Pages and routes
│   ├── components/   # React components
│   └── package.json
└── agent/            # Device client
    ├── agent.js      # Main agent file
    └── package.json
```

### Tech Stack

- **Backend**: Node.js, WebSocket (ws)
- **Dashboard**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Agent**: Node.js, WebSocket, screenshot-desktop

## 🐛 Troubleshooting

### Backend Won't Start

```bash
cd backend
npm install
npm start
```

### Dashboard Can't Connect

1. Check backend is running
2. Verify `.env.local` has correct URL
3. Restart dashboard: `npm run dev`

### Agent Can't Connect

1. Check backend is running
2. Verify password is set: `node agent.js login`
3. Check `BACKEND_URL` environment variable

### Common Issues

See [WEBSOCKET_CONNECTION_FIX.md](WEBSOCKET_CONNECTION_FIX.md) for detailed
troubleshooting.

## 📊 System Requirements

### Backend

- Node.js 18+
- 512MB RAM minimum
- Any OS (Windows, macOS, Linux)

### Dashboard

- Modern web browser
- Internet connection

### Agent

- Node.js 18+
- Windows 10+, macOS 10.15+, or Linux
- 256MB RAM minimum

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for
details.

## 🙏 Acknowledgments

- Built with Next.js, React, and Node.js
- WebSocket communication using ws library
- UI components with Tailwind CSS

## 📞 Support

For issues and questions:

1. Check documentation files
2. Review troubleshooting guides
3. Open an issue on GitHub

## 🗺️ Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] File manager with drag-and-drop
- [ ] Terminal emulator
- [ ] Process manager
- [ ] Network monitoring
- [ ] Scheduled tasks
- [ ] Multi-user support
- [ ] Role-based access control

## ⚡ Performance

- Real-time WebSocket communication
- Minimal latency (<100ms typical)
- Efficient resource usage
- Scales to multiple devices

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

Made with ❤️ by the Vortix Team
