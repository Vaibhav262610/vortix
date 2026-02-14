# Vortix 🚀

AI-Powered Remote OS Control System

Control your computers remotely from anywhere with a beautiful web dashboard and
AI-powered command generation.

[![npm version](https://img.shields.io/npm/v/vortix.svg)](https://www.npmjs.com/package/vortix)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🖥️ **Remote Control**: Control multiple computers from a web dashboard
- 🤖 **AI Commands**: Generate commands from natural language (experimental)
- 🔒 **Secure**: Password-protected devices with SHA-256 hashing
- ⚡ **Real-time**: WebSocket-based instant command execution
- 📊 **Live Logs**: See command output in real-time
- 🎨 **Modern UI**: Beautiful, responsive dashboard built with Next.js

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

Visit: [https://vortixredeploy.vercel.app](https://vortixredeploy.vercel.app)

---

## 📖 Documentation

Full documentation available in [DOCUMENTATION.md](./DOCUMENTATION.md)

- Installation & Setup
- Usage Guide
- Security Best Practices
- API Reference
- Troubleshooting
- Development Guide

---

## 🏗️ Architecture

```
Dashboard (Vercel) ←→ Backend (Render) ←→ CLI Agent (Your PC)
   Next.js              WebSocket           Node.js
```

---

## 🛠️ Tech Stack

- **CLI**: Node.js, WebSocket
- **Backend**: Node.js, WebSocket Server, Groq API
- **Dashboard**: Next.js 16, React 19, TypeScript, Tailwind CSS

---

## 📦 Project Structure

```
vortix/
├── cli_vortix/     # npm package
├── backend/        # WebSocket server
├── dashboard/      # Next.js dashboard
├── agent/          # Development agent
└── docs/           # Documentation
```

---

## 🔐 Security

- Password-protected devices
- SHA-256 password hashing
- Per-session authentication
- No plain-text password storage

---

## 🌐 Live Deployments

- **Dashboard**: https://vortixredeploy.vercel.app
- **Backend**: https://vortix.onrender.com
- **npm Package**: https://www.npmjs.com/package/vortix

---

## 📝 Example Commands

**Direct Commands:**

```bash
dir C:\Users\YourName\Desktop
echo Hello World > test.txt
start notepad
```

**AI-Powered (experimental):**

```
create a hello.html file on desktop
show me all files in downloads folder
open calculator
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

**Need help?**

- Check [DOCUMENTATION.md](./DOCUMENTATION.md)
- Open an issue on GitHub

---

## 🚧 Development Status

Currently in active development. Some AI features are experimental.

**Stable:**

- ✅ Remote command execution
- ✅ Device management
- ✅ Password authentication
- ✅ Real-time logs

**Experimental:**

- 🚧 AI command generation
- 🚧 Natural language processing

---

## 🔮 Roadmap

- [ ] Database integration
- [ ] User accounts
- [ ] Command history
- [ ] Multi-platform support (macOS, Linux)
- [ ] Mobile app
- [ ] File transfer

---

## 👨‍💻 Author

**Vaibhav Rajpoot**

- Email: vaibhavrajpoot2626@gmail.com
- Portfolio: [vaibhavrajpoot.vercel.app](https://vaibhavrajpoot.vercel.app)
- GitHub: [@Vaibhav262610](https://github.com/Vaibhav262610)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- Groq API for AI command generation
- Render for backend hosting
- Vercel for dashboard hosting
- npm for package distribution

---

## 📊 Stats

- **Version**: 1.0.2
- **Downloads**: Check on [npm](https://www.npmjs.com/package/vortix)
- **Status**: Active Development

---

**Made with ❤️ by Vaibhav Rajpoot**
