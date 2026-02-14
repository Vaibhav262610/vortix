# Vortix Quick Start Guide

## 📦 What Gets Deployed Where

### 1. **CLI Package (npm)** ✅

- **What**: `cli_vortix/` folder
- **Includes**: Agent + Backend bundled together
- **Users install**: `npm install -g vortix`
- **Commands available**: `vortix login`, `vortix start`, `vortix backend`

### 2. **Backend Server (Cloud)** ☁️

- **What**: `backend/server.js`
- **Deploy to**: Railway / Render / Heroku
- **Purpose**: WebSocket server for device coordination
- **Port**: 8080 (or cloud provider's assigned port)

### 3. **Dashboard (Vercel)** 🌐

- **What**: `dashboard/` folder (Next.js app)
- **Deploy to**: Vercel / Netlify
- **Purpose**: Web UI to control devices
- **Access**: https://your-dashboard.vercel.app

---

## 🚀 Publishing to npm (5 Minutes)

### Step 1: Create npm Account

```bash
# Go to https://www.npmjs.com/signup
# Create account, verify email
```

### Step 2: Login to npm

```bash
npm login
# Enter username, password, email
```

### Step 3: Update Package Info

Edit `cli_vortix/package.json`:

```json
{
	"name": "vortix",
	"author": "Your Name <your.email@example.com>",
	"repository": {
		"url": "https://github.com/yourusername/vortix.git"
	}
}
```

### Step 4: Publish

```bash
cd cli_vortix
npm install
npm publish --access public
```

✅ **Done!** Users can now install: `npm install -g vortix`

---

## ☁️ Deploy Backend (Railway - Easiest)

### Option 1: Railway (Recommended)

1. **Install Railway CLI**:

```bash
npm install -g @railway/cli
```

2. **Login**:

```bash
railway login
```

3. **Deploy**:

```bash
cd backend
railway init
railway up
```

4. **Get URL**:

```bash
railway domain
# Example output: vortix-backend.railway.app
```

### Option 2: Render.com (No CLI needed)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Click "Create Web Service"

---

## 🌐 Deploy Dashboard (Vercel - Easiest)

### Option 1: Vercel CLI

```bash
npm install -g vercel
cd dashboard
vercel
```

### Option 2: Vercel GitHub Integration

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Settings:
   - **Root Directory**: `dashboard`
   - **Framework**: Next.js (auto-detected)
5. Add Environment Variable:
   - **Key**: `NEXT_PUBLIC_BACKEND_WS`
   - **Value**: `wss://your-backend.railway.app`
6. Click "Deploy"

---

## 🔧 Post-Deployment Configuration

### Update Agent with Backend URL

Edit `agent/agent.js` (line ~30):

```javascript
// BEFORE:
const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

// AFTER:
const ws = new WebSocket(`wss://your-backend.railway.app?token=${token}`);
```

Then republish to npm:

```bash
cd cli_vortix
npm version patch
npm publish
```

### Update Dashboard with Backend URL

Create `dashboard/.env.local`:

```
NEXT_PUBLIC_BACKEND_WS=wss://your-backend.railway.app
```

Redeploy:

```bash
vercel --prod
```

---

## 📱 How Users Use Your App

### 1. Install CLI

```bash
npm install -g vortix
```

### 2. On Server Machine (runs backend)

```bash
vortix backend
# Keeps running, handles all device connections
```

### 3. On Each Device to Control

```bash
# First time setup
vortix login

# Start agent
vortix start
# Keeps running, waits for commands
```

### 4. Control via Dashboard

- Open: https://your-dashboard.vercel.app
- See all connected devices
- Send commands to any device

---

## 🧪 Testing Everything

### Test 1: Backend is Running

```bash
# Install wscat
npm install -g wscat

# Test connection
wscat -c wss://your-backend.railway.app?token=test
```

### Test 2: Agent Connects

```bash
vortix start
# Should show: "Authenticated and connected to backend"
```

### Test 3: Dashboard Shows Devices

- Open dashboard URL
- Should see your device listed as "online"

---

## 📊 Architecture Summary

```
┌─────────────────┐
│   npm Registry  │  ← You publish CLI here
│   (vortix pkg)  │
└─────────────────┘
        ↓ npm install -g vortix

┌─────────────────┐     WebSocket      ┌──────────────┐
│  User's Device  │ ←─────────────────→ │   Backend    │
│  (vortix start) │                     │  (Railway)   │
└─────────────────┘                     └──────────────┘
                                               ↑
                                               │ WebSocket
                                               │
                                        ┌──────────────┐
                                        │  Dashboard   │
                                        │  (Vercel)    │
                                        └──────────────┘
```

---

## 🔐 Security Notes

⚠️ **Current Setup**: Basic token authentication (hostname-based)

**For Production**:

1. Implement proper JWT authentication
2. Use HTTPS/WSS only
3. Add rate limiting
4. Validate all commands
5. Add user permissions system

---

## 💰 Cost Estimate

- **npm**: Free
- **Railway**: Free tier (500 hours/month)
- **Vercel**: Free tier (unlimited hobby projects)
- **Total**: $0/month for small usage

---

## 🆘 Troubleshooting

### "npm publish" fails

```bash
# Check if name is taken
npm search vortix

# Try different name in package.json
"name": "vortix-ai-control"
```

### Agent can't connect

1. Check backend URL in `agent/agent.js`
2. Verify backend is running: `curl https://your-backend.railway.app`
3. Check firewall settings

### Dashboard not updating

1. Check browser console for WebSocket errors
2. Verify `NEXT_PUBLIC_BACKEND_WS` environment variable
3. Redeploy dashboard after changes

---

## 📚 Next Steps

1. ✅ Publish to npm
2. ✅ Deploy backend to Railway
3. ✅ Deploy dashboard to Vercel
4. ✅ Update URLs in code
5. ✅ Test end-to-end
6. 📝 Add authentication
7. 📝 Add command validation
8. 📝 Add usage analytics

---

## 🎉 You're Done!

Your app is now:

- ✅ Installable via npm
- ✅ Backend running in cloud
- ✅ Dashboard accessible worldwide
- ✅ Ready for users!

Share your npm package:

```bash
npm info vortix
```
