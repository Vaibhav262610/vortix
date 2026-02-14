# Vortix - AI-Powered OS Control System

Remote command execution and device management powered by AI.

---

## ⚡ Quick Start

**Ready to deploy?** → [GET_STARTED.md](GET_STARTED.md)

**Total time: ~17 minutes | Cost: $0/month**

---

## 🚀 Quick Links

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in 5 minutes
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Detailed deployment instructions
- **[Checklist](docs/CHECKLIST.md)** - Step-by-step deployment checklist
- **[Architecture](docs/ARCHITECTURE.md)** - System design and data flow
- **[Summary](docs/SUMMARY.md)** - Complete overview

## 📦 What is Vortix?

Vortix is a distributed system that lets you control multiple computers remotely
through a web dashboard. It uses AI to convert natural language requests into
executable commands.

### Key Features

- 🌐 **Web Dashboard** - Control all devices from one interface
- 🤖 **AI Planning** - Convert natural language to commands
- 📡 **Real-time** - WebSocket-based instant communication
- 🔒 **Secure** - Token-based authentication
- 📊 **Logging** - See command output in real-time
- 🖥️ **Cross-platform** - Works on Windows, Mac, Linux

## 🏗️ Architecture

```
┌─────────────┐     WebSocket      ┌──────────────┐
│   Devices   │ ←─────────────────→ │   Backend    │
│  (Agents)   │                     │  (Railway)   │
└─────────────┘                     └──────────────┘
                                           ↑
                                           │ WebSocket
                                           │
                                    ┌──────────────┐
                                    │  Dashboard   │
                                    │  (Vercel)    │
                                    └──────────────┘
```

## 📁 Project Structure

```
vortix/
├── cli_vortix/      # npm package (CLI + Agent bundled)
├── agent/           # Device agent (bundled with CLI)
├── backend/         # WebSocket server (deploy to cloud)
├── dashboard/       # Web UI (deploy to Vercel)
└── docs/            # Documentation
```

## 🎯 Getting Started

### For Users

Install the CLI globally:

```bash
npm install -g vortix
```

Start the agent on your device:

```bash
vortix start
```

Open the dashboard and control your device!

### For Developers

1. **Publish to npm**:

```bash
cd cli_vortix
npm publish --access public
```

2. **Deploy backend**:

```bash
cd backend
railway up
```

3. **Deploy dashboard**:

```bash
cd dashboard
vercel
```

See [QUICK_START.md](docs/QUICK_START.md) for detailed instructions.

## 📚 Documentation

- **[QUICK_START.md](docs/QUICK_START.md)** - Fast setup (5 minutes)
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Complete deployment guide
- **[CHECKLIST.md](docs/CHECKLIST.md)** - Deployment checklist
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture
- **[SUMMARY.md](docs/SUMMARY.md)** - Project overview

## 🛠️ Technology Stack

- **CLI/Agent**: Node.js, WebSocket
- **Backend**: Node.js, WebSocket Server, Ollama/OpenAI
- **Dashboard**: Next.js, React, TypeScript, Tailwind CSS

## 🔐 Security

Current implementation uses basic hostname-based tokens. For production:

- Implement JWT authentication
- Add rate limiting
- Validate all commands
- Use HTTPS/WSS only
- Add user permissions

## 💰 Costs

- npm: Free
- Railway: Free tier (500 hrs/month)
- Vercel: Free tier (unlimited)
- **Total**: $0/month for hobby use

## 🤝 Contributing

Contributions welcome! Please read the documentation first.

## 📄 License

MIT

## 🆘 Support

- Check documentation in `/docs`
- Open an issue on GitHub
- See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for troubleshooting

## 🎉 Next Steps

1. Read [QUICK_START.md](docs/QUICK_START.md)
2. Follow [CHECKLIST.md](docs/CHECKLIST.md)
3. Deploy and test
4. Share your feedback!

---

**Made with ❤️ for remote device management**
