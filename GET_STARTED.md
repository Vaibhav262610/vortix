# 🚀 Get Started with Vortix

## What You Need to Do

Your Vortix app is ready to deploy! Here's what you need to do:

### 1️⃣ Publish to npm (5 minutes)

```bash
# Login to npm (create account at npmjs.com first)
npm login

# Publish your package
cd cli_vortix
npm publish --access public
```

✅ **Done!** Users can now install: `npm install -g vortix`

---

### 2️⃣ Deploy Backend (5 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway up
```

✅ **Done!** Your backend is running in the cloud

---

### 3️⃣ Deploy Dashboard (5 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd dashboard
vercel
```

✅ **Done!** Your dashboard is live

---

### 4️⃣ Update URLs (2 minutes)

Edit `agent/agent.js` (line ~30):

```javascript
// Change this:
const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

// To this (use your Railway URL):
const ws = new WebSocket(`wss://your-backend.railway.app?token=${token}`);
```

Then republish:

```bash
cd cli_vortix
npm version patch
npm publish
```

✅ **Done!** Everything is connected

---

## 📚 Full Documentation

All documentation is in the `docs/` folder:

- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Detailed 5-minute guide
- **[docs/CHECKLIST.md](docs/CHECKLIST.md)** - Step-by-step checklist
- **[docs/VISUAL_GUIDE.md](docs/VISUAL_GUIDE.md)** - Visual diagrams
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Complete deployment guide
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical details
- **[docs/COMMANDS.md](docs/COMMANDS.md)** - Command reference
- **[docs/SUMMARY.md](docs/SUMMARY.md)** - Project overview

---

## 🎯 What Gets Deployed Where

| Component   | Deploy To        | Command                       |
| ----------- | ---------------- | ----------------------------- |
| CLI Package | npm              | `npm publish --access public` |
| Backend     | Railway          | `railway up`                  |
| Dashboard   | Vercel           | `vercel`                      |
| Agent       | Bundled with CLI | (users install via npm)       |

---

## 💡 How Users Will Use It

```bash
# 1. Install
npm install -g vortix

# 2. Start agent
vortix start

# 3. Open dashboard
# Go to: https://your-dashboard.vercel.app

# 4. Control devices from dashboard
```

---

## 🔧 What I've Set Up For You

✅ CLI package structure (`cli_vortix/`) ✅ CLI entry point
(`cli_vortix/bin/vortix.js`) ✅ npm package configuration ✅ Complete
documentation (7 guides) ✅ Deployment scripts ✅ README files

---

## 📖 Start Here

1. **Quick Deploy**: Read [docs/QUICK_START.md](docs/QUICK_START.md)
2. **Follow Checklist**: Use [docs/CHECKLIST.md](docs/CHECKLIST.md)
3. **Visual Guide**: See [docs/VISUAL_GUIDE.md](docs/VISUAL_GUIDE.md)

---

## 🆘 Need Help?

- Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for troubleshooting
- See [docs/COMMANDS.md](docs/COMMANDS.md) for command reference
- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details

---

## 💰 Cost

- npm: **Free**
- Railway: **Free tier** (500 hrs/month)
- Vercel: **Free tier** (unlimited)
- **Total: $0/month**

---

## ⏱️ Time Estimate

- npm publishing: 5 minutes
- Backend deployment: 5 minutes
- Dashboard deployment: 5 minutes
- URL updates: 2 minutes
- **Total: ~17 minutes**

---

## 🎉 Next Steps

1. Open [docs/QUICK_START.md](docs/QUICK_START.md)
2. Follow the steps
3. Deploy your app
4. Share it with the world!

---

**Everything is ready. Let's deploy!** 🚀
