# Backend Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Fixed package.json main file (server.js)
- [x] Fixed PORT configuration
- [x] Removed unused dependencies (openai, uuid)
- [x] Cleaned up imports
- [x] No diagnostic errors

## 🚀 Deploy to Railway (Recommended)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize and Deploy

```bash
cd backend
railway init
railway up
```

### Step 4: Get Your URL

```bash
railway domain
```

Example output: `vortix-backend.railway.app`

### Step 5: Test Connection

```bash
# Install wscat
npm install -g wscat

# Test connection
wscat -c wss://vortix-backend.railway.app?token=test
```

## 🔧 Alternative: Deploy to Render

### Step 1: Go to Render.com

https://render.com

### Step 2: Create Web Service

- Click "New +" → "Web Service"
- Connect your GitHub repository

### Step 3: Configure

- **Name**: vortix-backend
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Deploy

Click "Create Web Service"

### Step 5: Get URL

Your service will be at: `https://vortix-backend.onrender.com`

## 🔧 Alternative: Deploy to Heroku

### Step 1: Install Heroku CLI

https://devcenter.heroku.com/articles/heroku-cli

### Step 2: Login

```bash
heroku login
```

### Step 3: Create App

```bash
cd backend
heroku create vortix-backend
```

### Step 4: Deploy

```bash
git push heroku main
```

### Step 5: Get URL

```bash
heroku open
```

## 📝 Post-Deployment

### 1. Save Your Backend URL

```
Backend URL: wss://your-backend-url.railway.app
```

### 2. Update Agent

Edit `agent/agent.js` (line ~30):

```javascript
const ws = new WebSocket(`wss://your-backend-url.railway.app?token=${token}`);
```

### 3. Update Dashboard

Create `dashboard/.env.local`:

```
NEXT_PUBLIC_BACKEND_WS=wss://your-backend-url.railway.app
```

### 4. Test Everything

```bash
# Test WebSocket connection
wscat -c wss://your-backend-url.railway.app?token=test

# Should connect without errors
```

## 🔍 Monitoring

### Railway

```bash
# View logs
railway logs --tail

# Check status
railway status

# View variables
railway variables
```

### Render

- Check logs in Render dashboard
- Monitor at: https://dashboard.render.com

### Heroku

```bash
# View logs
heroku logs --tail

# Check status
heroku ps
```

## 🐛 Troubleshooting

### Connection Refused

- Check if backend is running
- Verify PORT is set correctly
- Check firewall settings

### WebSocket Upgrade Failed

- Ensure using `wss://` (not `ws://`) in production
- Check if hosting provider supports WebSocket

### AI Planning Not Working

- Ollama must be running locally (not on cloud)
- Consider switching to OpenAI API for cloud deployment
- Or remove AI planning feature

### Port Already in Use

```bash
# Railway/Render handle this automatically
# For local testing, change PORT in .env
```

## 🔐 Security Notes

### Current Setup

- Basic token authentication (hostname-based)
- No rate limiting
- No command validation

### For Production

1. Implement JWT authentication
2. Add rate limiting
3. Validate all commands
4. Use environment variables for secrets
5. Enable CORS properly
6. Add request logging

## 📊 Expected Behavior

### Successful Deployment

```
✅ Backend running on port 8080
✅ WebSocket server accepting connections
✅ Devices can connect
✅ Dashboard can connect
✅ Commands route correctly
```

### Logs Should Show

```
Backend running on port 8080
Type: send <DeviceName> <command>
Registered device: Test-Device
Token: device-test-device
Registered device: VAIBHAV-PC
Token: device-vaibhav-pc
```

## 🎯 Success Criteria

- [ ] Backend deployed to cloud
- [ ] WebSocket connections work
- [ ] URL saved and documented
- [ ] Agent updated with new URL
- [ ] Dashboard updated with new URL
- [ ] End-to-end test successful

## 💰 Costs

- **Railway**: Free tier (500 hrs/month)
- **Render**: Free tier (750 hrs/month)
- **Heroku**: Free tier discontinued, starts at $7/month

## 📞 Support

- Railway: https://railway.app/help
- Render: https://render.com/docs
- Heroku: https://help.heroku.com

---

**Your backend is ready to deploy!** 🚀
