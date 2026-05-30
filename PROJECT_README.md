# Vortix - AI-Powered Remote OS Control System

A comprehensive remote control system that allows you to manage and control
multiple devices through natural language commands via a modern web dashboard.

## 🏗️ Project Architecture

### Core Components

**1. Agent (`/agent`)**

- Local agent that runs on target devices
- Handles command execution and system monitoring
- WebSocket client that connects to backend
- Cross-platform support (Windows, macOS, Linux)

**2. Backend (`/backend`)**

- WebSocket server for real-time communication
- Handles authentication and device management
- AI command processing and routing
- Deployed on cloud platforms (Railway, Render, etc.)

**3. Dashboard (`/dashboard`)**

- Modern Next.js web application
- Real-time device monitoring and control
- Mobile-responsive interface
- Command execution with AI assistance

**4. CLI Package (`/cli_vortix`)**

- NPM package for easy installation
- Contains agent, backend, and setup scripts
- Published as `vortix` on npm registry

## 🚀 Technology Stack

### Frontend (Dashboard)

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **WebSocket** - Real-time communication

### Backend

- **Node.js** - Runtime environment
- **WebSocket (ws)** - Real-time bidirectional communication
- **Express.js** - HTTP server for health checks
- **Groq AI** - Natural language command processing

### Agent

- **Node.js** - Cross-platform runtime
- **WebSocket** - Backend communication
- **Child Process** - Command execution
- **Screenshot Desktop** - Screen capture functionality
- **OS Module** - System information gathering

### Infrastructure

- **Railway** - Backend hosting
- **Vercel** - Dashboard hosting
- **NPM** - Package distribution

## 📁 Project Structure

```
vortix/
├── agent/                    # Local agent for target devices
│   ├── agent.js             # Main agent logic
│   ├── auth.js              # Authentication handling
│   ├── config.json          # Configuration
│   └── package.json         # Dependencies
├── backend/                  # WebSocket server
│   ├── server.js            # Main server logic
│   ├── package.json         # Dependencies
│   └── railway.json         # Deployment config
├── dashboard/                # Next.js web application
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   └── package.json         # Dependencies
├── cli_vortix/              # NPM package
│   ├── agent/               # Bundled agent files
│   ├── backend/             # Bundled backend files
│   ├── bin/                 # CLI executable
│   ├── scripts/             # Installation scripts
│   └── package.json         # Package configuration
└── docs/                    # Documentation
    ├── ARCHITECTURE.md      # System architecture
    ├── DEPLOYMENT.md        # Deployment guide
    └── QUICK_START.md       # Getting started
```

## 🔧 Development Setup

### Prerequisites

- Node.js 14+
- npm or yarn
- Git

### Local Development

1. **Clone the repository:**

```bash
git clone https://github.com/Vaibhav262610/vortix.git
cd vortix
```

2. **Setup Backend:**

```bash
cd backend
npm install
npm start
```

3. **Setup Dashboard:**

```bash
cd dashboard
npm install
npm run dev
```

4. **Setup Agent:**

```bash
cd agent
npm install
node agent.js login
node agent.js start
```

### Environment Variables

**Dashboard (`.env.local`):**

```env
NEXT_PUBLIC_BACKEND_WS=wss://your-backend-url.com
```

**Backend (`.env`):**

```env
PORT=8080
GROQ_API_KEY=your-groq-api-key
```

## 🚀 Deployment

### Backend Deployment (Railway)

1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy from `backend` folder

### Dashboard Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Set build command: `cd dashboard && npm run build`
3. Set environment variables

### CLI Package Publishing

```bash
cd cli_vortix
npm version patch
npm publish
```

## 📦 Features

### Core Functionality

- **Natural Language Commands** - AI-powered command generation
- **Multi-device Control** - Manage multiple devices simultaneously
- **Real-time Monitoring** - Live system stats and logs
- **File Transfer** - Upload/download files remotely
- **Secure Authentication** - Password-protected device access

### Dashboard Features

- **Command Center** - Execute commands with AI assistance
- **Device Management** - View and control connected devices
- **System Stats** - Real-time CPU, memory, disk usage
- **Mobile Support** - Responsive design for all devices
- **Dark Theme** - Modern glass-morphism UI

### Agent Features

- **Cross-platform** - Windows, macOS, Linux support
- **Auto-start** - Optional boot-time startup
- **System Integration** - Deep OS-level command execution
- **Secure Connection** - Encrypted WebSocket communication

## 🔒 Security

- **Password Authentication** - Device-level access control
- **WebSocket Encryption** - WSS for secure communication
- **Command Validation** - AI-powered safety checks
- **No Data Storage** - Commands executed locally only

## 📊 Monitoring & Logging

- **Real-time Logs** - Live command output and system messages
- **System Stats** - CPU, memory, disk usage tracking
- **Connection Status** - Device online/offline monitoring
- **Error Handling** - Comprehensive error reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Vaibhav Rajpoot**

- GitHub: [@Vaibhav262610](https://github.com/Vaibhav262610)
- Email: vaibhavrajpoot2626@gmail.com

## 🔗 Links

- **Live Dashboard:** [https://vortixai.vercel.app](https://vortixai.vercel.app)
- **NPM Package:**
  [https://www.npmjs.com/package/vortix](https://www.npmjs.com/package/vortix)
- **Documentation:**
  [https://github.com/Vaibhav262610/vortix/tree/main/docs](https://github.com/Vaibhav262610/vortix/tree/main/docs)

---

**Built with ❤️ for developers who need powerful remote control capabilities**
