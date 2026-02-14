# Vortix Deployment Guide

## Publishing to npm

### Prerequisites

1. Create npm account at https://www.npmjs.com/signup
2. Login to npm CLI:

```bash
npm login
```

### Publish Steps

1. **Navigate to CLI folder**:

```bash
cd cli_vortix
```

2. **Install dependencies**:

```bash
npm install
```

3. **Test locally** (optional):

```bash
npm link
vortix help
```

4. **Publish to npm**:

```bash
npm publish --access public
```

5. **Update version for future releases**:

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

## Deployment Architecture

### What to Deploy Where

#### 1. Backend Server (Deploy to Cloud)

**Location**: `backend/server.js`

**Deployment Options**:

**Option A: Railway.app** (Recommended - Free tier available)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy from backend folder
cd backend
railway init
railway up
```

**Option B: Render.com**

1. Go to https://render.com
2. Create new "Web Service"
3. Connect your GitHub repo
4. Set:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Root Directory: `backend`

**Option C: Heroku**

```bash
cd backend
heroku create vortix-backend
git push heroku main
```

**Environment Variables Needed**:

- None required for basic setup
- Add `OPENAI_API_KEY` if using OpenAI instead of local LLM

**Important**: Update WebSocket URL in agent and dashboard after deployment!

#### 2. Dashboard (Deploy to Vercel/Netlify)

**Location**: `dashboard/`

**Vercel Deployment** (Recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd dashboard
vercel
```

Or connect via GitHub:

1. Go to https://vercel.com
2. Import your repository
3. Set root directory to `dashboard`
4. Deploy

**Environment Variables**: Create `dashboard/.env.local`:

```
NEXT_PUBLIC_BACKEND_WS=wss://your-backend-url.railway.app
```

#### 3. Agent (Installed via npm)

**Location**: `agent/` (bundled with CLI)

Users install globally:

```bash
npm install -g vortix
```

**Configuration**: Update `agent/agent.js` line with your deployed backend URL:

```javascript
const ws = new WebSocket(`wss://your-backend-url.railway.app?token=${token}`);
```

## Post-Deployment Configuration

### 1. Update Backend URL in Agent

Edit `agent/agent.js`:

```javascript
// Change from:
const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

// To:
const ws = new WebSocket(`wss://your-backend.railway.app?token=${token}`);
```

### 2. Update Backend URL in Dashboard

Edit `dashboard/.env.local`:

```
NEXT_PUBLIC_BACKEND_WS=wss://your-backend.railway.app
```

### 3. Enable CORS (if needed)

Add to `backend/server.js` if you face CORS issues:

```javascript
const cors = require("cors");
app.use(cors());
```

## Testing Deployment

1. **Test Backend**:

```bash
wscat -c wss://your-backend.railway.app?token=test-token
```

2. **Test Agent**:

```bash
vortix start
```

3. **Test Dashboard**: Open your Vercel URL in browser

## Monitoring

### Backend Logs

- Railway: Check dashboard logs
- Render: Check service logs
- Heroku: `heroku logs --tail`

### Agent Logs

Check terminal where `vortix start` is running

## Security Considerations

1. **Use WSS (WebSocket Secure)** in production
2. **Implement proper authentication** (current token system is basic)
3. **Add rate limiting** to prevent abuse
4. **Validate commands** before execution
5. **Use environment variables** for sensitive data

## Scaling

- Backend: Increase server resources on your hosting platform
- Agents: No limit, each device runs independently
- Dashboard: Vercel handles scaling automatically

## Troubleshooting

### Agent can't connect

- Check backend URL is correct
- Verify backend is running
- Check firewall/network settings

### Dashboard not updating

- Check WebSocket connection in browser console
- Verify backend URL in environment variables

### Commands not executing

- Check agent logs
- Verify device is registered
- Check command syntax for target OS
