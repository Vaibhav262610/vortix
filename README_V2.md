# Vortix 2.0 - Now with Authentication & Database! 🎉

> AI-Powered Remote OS Control with User Accounts and Command History

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Vaibhav262610/vortix)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-stable-success.svg)]()

---

## 🆕 What's New in v2.0

### Major Features

- 🔐 **User Authentication** - Sign up/sign in with Clerk
- 🗄️ **Database Integration** - PostgreSQL with Prisma ORM
- 📊 **Command History** - All commands saved and searchable
- 🔍 **Search Functionality** - Find past commands instantly
- 📈 **Statistics** - Track command usage and success rates
- 👥 **Multi-user Support** - Each user has their own devices and history

---

## ⚡ Quick Start

### 1. Install CLI

```bash
npm install -g vortix
```

### 2. Set Up Authentication (5 minutes)

```bash
# Get free API keys from https://clerk.com
# Add to dashboard/.env.local:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
```

### 3. Set Up Database (10 minutes)

```bash
cd backend
npx prisma dev              # Starts local database
npx prisma generate         # Generates client
npx prisma migrate dev      # Creates tables
```

### 4. Start Everything

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Dashboard
cd dashboard && npm run dev
```

### 5. Use It!

- Visit **http://localhost:3000/auth**
- Sign up for an account
- Add your devices
- Execute commands
- View history!

**Full Guide:** See [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)

---

## 🎯 Features

### Core Features (v1.x)

- ✅ Remote command execution
- ✅ Multi-device management
- ✅ Real-time logging
- ✅ AI command generation
- ✅ Screen sharing
- ✅ File transfer
- ✅ System monitoring
- ✅ Auto-start on boot
- ✅ Cross-platform (Windows, macOS, Linux)

### New Features (v2.0)

- ✅ User authentication
- ✅ Command history storage
- ✅ Search past commands
- ✅ Command statistics
- ✅ Multi-user support
- ✅ API endpoints
- ✅ Database integration

---

## 📊 Command History

### Automatic Saving

Every command you execute is automatically saved:

- Command text
- Output
- Exit code
- Execution time
- Device name
- Timestamp

### Search & Filter

```
🔍 Search: "npm install"
📱 Filter by device
📅 Sort by date
✅ Filter by status (success/error)
```

### View Details

Click any command to see:

- Full output
- Exit code
- Duration
- Device info
- Timestamp

---

## 🔐 Authentication

### Sign Up

1. Visit `/auth`
2. Enter email and password
3. Verify email
4. Start using!

### Sign In

1. Visit `/auth`
2. Enter credentials
3. Access your dashboard

### OAuth Support

- Google
- GitHub
- Microsoft
- More coming soon!

---

## 🗄️ Database

### Supported Databases

- **Prisma Postgres** (easiest, for development)
- **Neon** (recommended for production)
- **Supabase** (great free tier)
- **Railway** (easy deployment)
- **Local PostgreSQL** (full control)

### Tables

- **Users** - User accounts
- **Devices** - Registered devices
- **CommandHistory** - All commands
- **Sessions** - Active connections

---

## 🔌 API Endpoints

### GET /api/history

Get command history

```bash
GET /api/history?userId=xxx&search=npm&limit=50
```

### GET /api/stats

Get statistics

```bash
GET /api/stats?userId=xxx
```

### Response Example

```json
{
	"commands": [
		{
			"id": "cmd_123",
			"command": "npm install",
			"output": "added 150 packages",
			"exitCode": 0,
			"status": "success",
			"executedAt": "2026-05-30T10:30:00Z",
			"duration": 5420,
			"device": {
				"deviceName": "MY-PC",
				"platform": "win32"
			}
		}
	],
	"total": 150
}
```

---

## 📚 Documentation

### Setup Guides

- **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - Start here! (20 min)
- **[AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md)** - Detailed auth setup
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details

### Feature Docs

- **[WHATS_NEW.md](WHATS_NEW.md)** - New features overview
- **[docs/NEW_FEATURES.md](docs/NEW_FEATURES.md)** - Feature documentation
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Quick start guide

### Development

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment guide
- **[FEATURE_ROADMAP.md](FEATURE_ROADMAP.md)** - Future plans

---

## 🚀 Deployment

### Production Setup

**1. Database (Neon)**

```bash
# Create database at https://neon.tech
# Copy connection string
# Add to backend/.env:
DATABASE_URL="postgresql://..."
```

**2. Backend (Render)**

```bash
# Deploy to Render
# Set environment variables:
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...
NODE_ENV=production
```

**3. Dashboard (Vercel)**

```bash
# Deploy to Vercel
# Set environment variables:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_BACKEND_WS=wss://your-backend.com
```

**Full Guide:** See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🎨 Screenshots

### Authentication

```
┌─────────────────────────────────────┐
│         Welcome to Vortix           │
│                                     │
│  [Email]    user@example.com        │
│  [Password] ••••••••••              │
│                                     │
│  [ Sign In ]  [ Sign Up ]           │
│                                     │
│  ✓ AI-powered commands              │
│  ✓ Multi-device management          │
│  ✓ Command history                  │
└─────────────────────────────────────┘
```

### Command History

```
┌─────────────────────────────────────┐
│  🔍 Search commands...              │
├─────────────────────────────────────┤
│  ✓ npm install                      │
│    MY-PC • 2h ago • 5.4s            │
├─────────────────────────────────────┤
│  ✓ git status                       │
│    MY-PC • 3h ago • 0.2s            │
├─────────────────────────────────────┤
│  ✗ npm test                         │
│    MY-PC • 5h ago • 2.1s            │
└─────────────────────────────────────┘
```

---

## 🔧 Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Clerk (Auth)

### Backend

- Node.js
- WebSocket
- Express
- Prisma ORM
- PostgreSQL
- Groq AI

### Infrastructure

- Vercel (Dashboard)
- Render (Backend)
- Neon (Database)
- npm (CLI)

---

## 📊 Comparison

### Before (v1.2.2)

```
User opens dashboard
  ↓
Executes command
  ↓
Sees output
  ↓
Closes browser
  ↓
❌ History lost
```

### After (v2.0.0)

```
User signs in
  ↓
Executes command
  ↓
Sees output
  ↓
✅ Saved to database
  ↓
Can search anytime
  ↓
View statistics
```

---

## 🎯 Use Cases

### For Developers

- Remote development environments
- Deploy and monitor applications
- Run build scripts
- Manage multiple servers
- **NEW:** Track all commands executed

### For System Admins

- Server management
- System monitoring
- Automated tasks
- Multi-server control
- **NEW:** Audit trail of all actions

### For IT Support

- Remote troubleshooting
- User assistance
- System diagnostics
- **NEW:** Review command history

### For Power Users

- Home automation
- PC control from anywhere
- Scheduled tasks
- **NEW:** Command templates

---

## 🔒 Security

### Authentication

- Secure sign up/sign in
- Session management
- OAuth support
- Password hashing (SHA-256)

### Database

- Encrypted connections
- User isolation
- Input validation
- SQL injection prevention

### API

- Protected endpoints
- User authentication required
- Rate limiting (coming soon)
- CORS configuration

---

## 🐛 Troubleshooting

### Common Issues

**"Clerk: Missing publishable key"**

```bash
# Add to dashboard/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# Restart dev server
```

**"Can't reach database server"**

```bash
cd backend
npx prisma dev  # Start database
```

**"Prisma Client not generated"**

```bash
npx prisma generate
```

**More help:** See
[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md#troubleshooting)

---

## 📈 Roadmap

### v2.1.0 (Next Month)

- [ ] Command favorites
- [ ] Export history (CSV, JSON)
- [ ] Command templates
- [ ] Advanced search filters

### v2.2.0 (Q3 2026)

- [ ] Scheduled commands
- [ ] Command approval workflow
- [ ] Team collaboration
- [ ] Role-based access

### v3.0.0 (Q4 2026)

- [ ] Mobile app
- [ ] Desktop app
- [ ] Advanced analytics
- [ ] Plugin system

**Full Roadmap:** See [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md)

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 👨‍💻 Author

**Vaibhav Rajpoot**

- Email: vaibhavrajpoot2626@gmail.com
- GitHub: [@Vaibhav262610](https://github.com/Vaibhav262610)
- Portfolio: [vaibhavrajpoot.vercel.app](https://vaibhavrajpoot.vercel.app)

---

## 🔗 Links

- **Live Demo:** [vortixai.vercel.app](https://vortixai.vercel.app)
- **npm Package:**
  [npmjs.com/package/vortix](https://www.npmjs.com/package/vortix)
- **Documentation:**
  [GitHub Docs](https://github.com/Vaibhav262610/vortix/tree/main/docs)
- **Issues:** [GitHub Issues](https://github.com/Vaibhav262610/vortix/issues)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

## 📞 Support

- **Documentation:** Check the guides above
- **Issues:** [GitHub Issues](https://github.com/Vaibhav262610/vortix/issues)
- **Email:** vaibhavrajpoot2626@gmail.com
- **Discord:** Coming soon!

---

**Made with ❤️ by Vaibhav Rajpoot**

**Version 2.0.0** - Now with Authentication & Database!

---

## 🎉 Get Started Now!

```bash
# 1. Install
npm install -g vortix

# 2. Set up (20 minutes)
# Follow COMPLETE_SETUP_GUIDE.md

# 3. Start using!
vortix start
```

**Ready to control your computers from anywhere? Let's go! 🚀**
