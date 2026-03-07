# Vortix 🚀

AI-Powered Remote OS Control System

Control your computers remotely from anywhere with a beautiful web dashboard and
AI-powered command generation.

[![npm version](https://img.shields.io/npm/v/vortix.svg)](https://www.npmjs.com/package/vortix)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub issues](https://img.shields.io/github/issues/Vaibhav262610/vortix)](https://github.com/Vaibhav262610/vortix/issues)
[![GitHub stars](https://img.shields.io/github/stars/Vaibhav262610/vortix)](https://github.com/Vaibhav262610/vortix/stargazers)

---

## ✨ Features

- 🖥️ **Remote Control**: Control multiple computers from a web dashboard
- 🤖 **AI Commands**: Generate commands from natural language
- 🔒 **Secure**: Password-protected devices with SHA-256 hashing
- ⚡ **Real-time**: WebSocket-based instant command execution
- 📊 **Live Logs**: See command output in real-time
- 🎨 **Modern UI**: Beautiful, responsive dashboard built with Next.js
- 📺 **Screen Sharing**: View your desktop in real-time
- 🚀 **Auto-Start**: Start agent automatically on system boot
- ⌨️ **Keyboard Shortcuts**: Ctrl+Enter to send, Ctrl+K for quick commands
- 🌍 **Multi-Platform**: Windows, macOS, and Linux support

---

## 🚀 Quick Start

### 1. Install CLI

```bash
npm install -g vortix
```

### 2. Set Password

```bash
vortix login
```

### 3. Start Agent

```bash
vortix start
```

### 4. Open Dashboard

Visit: [https://vortixai.vercel.app](https://vortixai.vercel.app)

---

## 📖 Documentation

- [Installation & Setup](docs/QUICK_START.md)
- [Platform Guide](PLATFORM_GUIDE.md) - Windows, macOS, Linux
- [FAQ](FAQ.md) - Frequently Asked Questions
- [Contributing](CONTRIBUTING.md) - How to contribute
- [Security](SECURITY.md) - Security policy
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md) - Version history

---

## 🏗️ Architecture

```
Dashboard (Vercel) ←→ Backend (Render) ←→ CLI Agent (Your PC)
   Next.js              WebSocket           Node.js
```

### Components

- **Dashboard**: Next.js web interface for controlling devices
- **Backend**: WebSocket server for real-time communication
- **Agent**: CLI tool that runs on your computer
- **CLI Package**: npm package for easy installation

---

## 🛠️ Tech Stack

- **CLI**: Node.js, WebSocket, screenshot-desktop
- **Backend**: Node.js, WebSocket Server, Groq API
- **Dashboard**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Deployment**: Vercel (Dashboard), Render (Backend)

---

## 📦 Project Structure

```
vortix/
├── agent/          # Agent that runs on user's PC
├── backend/        # WebSocket server
├── dashboard/      # Next.js web dashboard
├── cli_vortix/     # NPM package for CLI
├── docs/           # Documentation
├── LICENSE         # MIT License
├── CONTRIBUTING.md # Contribution guidelines
├── SECURITY.md     # Security policy
└── README.md       # This file
```

---

## 🔐 Security

- Password-protected devices
- SHA-256 password hashing
- Per-device authentication
- No plain-text password storage
- WebSocket Secure (WSS) in production

See [SECURITY.md](SECURITY.md) for more details.

---

## 🌐 Live Deployments

- **Dashboard**: https://vortixai.vercel.app
- **Backend**: https://vortix.onrender.com
- **npm Package**: https://www.npmjs.com/package/vortix

---

## 📝 Example Commands

**Direct Commands:**

```bash
# Windows
dir C:\Users\YourName\Desktop
echo Hello World > test.txt
start notepad

# macOS
ls -la ~/Desktop
echo "Hello World" > test.txt
open -a TextEdit

# Linux
ls -la ~/Desktop
echo "Hello World" > test.txt
xdg-open .
```

**AI-Powered:**

```
create a hello.html file on desktop
show me all files in downloads folder
open notion
lock my computer
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for
details.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Vaibhav262610/vortix.git
cd vortix

# Install dependencies
cd agent && npm install
cd ../backend && npm install
cd ../dashboard && npm install

# Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Agent
cd agent && node agent.js start

# Terminal 3: Dashboard
cd dashboard && npm run dev
```

---

## 🐛 Troubleshooting

**Agent won't connect?**

- Check internet connection
- Verify backend is running
- Restart agent: `vortix start`

**Device shows as locked?**

- Click device and enter password
- Password is from `vortix login`

**Screen share not working?**

- Windows: Should work automatically
- macOS: Grant Screen Recording permission
- Linux: Install scrot (`sudo apt-get install scrot`)

**Auto-start not working?**

- Windows: Run as Administrator
- macOS: Grant necessary permissions
- Linux: Check systemd is available

**Need help?**

- Check [documentation](docs/)
- Open an [issue](https://github.com/Vaibhav262610/vortix/issues)
- Email: vaibhavrajpoot2626@gmail.com

---

## 🚧 Development Status

Currently in active development. All core features are stable.

**Stable:**

- ✅ Remote command execution
- ✅ Device management
- ✅ Password authentication
- ✅ Real-time logs
- ✅ Screen sharing
- ✅ Auto-start on boot
- ✅ Multi-platform support
- ✅ Keyboard shortcuts

**In Progress:**

- 🚧 AI command generation improvements
- 🚧 End-to-end encryption
- 🚧 Command history
- 🚧 File transfer

---

## 🔮 Roadmap

- [ ] Database integration
- [ ] User accounts
- [ ] Command history
- [ ] File transfer
- [ ] Mobile app
- [ ] Two-factor authentication
- [ ] Command approval system
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Plugin system

---

## 📊 Stats

- **Version**: 1.0.2
- **License**: MIT
- **Platform**: Windows, macOS, Linux
- **Node**: 18+
- **Status**: Active Development

---

## 🙏 Acknowledgments

- [Groq API](https://groq.com/) for AI command generation
- [Render](https://render.com/) for backend hosting
- [Vercel](https://vercel.com/) for dashboard hosting
- [npm](https://www.npmjs.com/) for package distribution
- All
  [contributors](https://github.com/Vaibhav262610/vortix/graphs/contributors)

---

## 👨‍💻 Author

**Vaibhav Rajpoot**

- Email: vaibhavrajpoot2626@gmail.com
- Portfolio: [vaibhavrajpoot.vercel.app](https://vaibhavrajpoot.vercel.app)
- GitHub: [@Vaibhav262610](https://github.com/Vaibhav262610)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/Vaibhav262610/vortix/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/Vaibhav262610/vortix/discussions)
- **Email**: vaibhavrajpoot2626@gmail.com

---

**Made with ❤️ by Vaibhav Rajpoot and
[contributors](https://github.com/Vaibhav262610/vortix/graphs/contributors)**
