# 🚀 Deploy Vortix to Production - Step by Step

## ✅ Pre-Deployment Checklist

- [ ] Code is tested locally
- [ ] All features work correctly
- [ ] No console errors
- [ ] Environment variables documented
- [ ] README updated
- [ ] Git repository ready

---

## 📦 Step 1: Prepare Repository

### 1.1 Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit - Vortix v1.0"
git branch -M main
git remote add origin https://github.com/yourusername/vortix.git
git push -u origin main
```

### 1.2 Verify Files

Make sure these files exist:

- `backend/server.js`
- `backend/package.json`
- `dashboard/package.json`
- `agent/agent.js`
- `agent/package.json`
- `README_PRODUCTION.md`
- `DEPLOYMENT_GUIDE.md`

---

## 🌐 Step 2: Deploy Backend (Render.com)

### 2.1 Create Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.2 Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `vortix-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter for better performance)

### 2.3 Deploy

1. Click "Create Web Service"
2. Wait for deployment (2-5 minutes)
3. Note your backend URL: `https://vortix-backend.onrender.com`
4. **Important**: Change `https://` to `wss://` for WebSocket
   - Backend URL: `wss://vortix-backend.onrender.com`

---

## 🎨 Step 3: Deploy Dashboard (Vercel)

### 3.1 Create Account

1. Go to https://vercel.com
2. Sign up with GitHub

### 3.2 Import Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.3 Set Environment Variable

1. Go to "Environment Variables"
2. Add:
   - **Name**: `NEXT_PUBLIC_BACKEND_WS`
   - **Value**: `wss://vortix-backend.onrender.com` (your backend URL)
3. Click "Add"

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Note your dashboard URL: `https://vortix-dashboard.vercel.app`

---

## 💻 Step 4: Configure Agent

### 4.1 Set Backend URL

```bash
# Windows
set BACKEND_URL=wss://vortix-backend.onrender.com

# macOS/Linux
export BACKEND_URL=wss://vortix-backend.onrender.com
```

### 4.2 Set Password

```bash
cd agent
node agent.js login
# Enter password: your-secure-password
```

### 4.3 Start Agent

```bash
node agent.js start
```

You should see:

```
✅ Authenticated and connected to backend successfully!
Connected to: wss://vortix-backend.onrender.com
```

---

## 🧪 Step 5: Test Deployment

### 5.1 Test Backend

```bash
# Check if backend is accessible
curl https://vortix-backend.onrender.com
```

### 5.2 Test Dashboard

1. Open: `https://vortix-dashboard.vercel.app`
2. Open browser console (F12)
3. Should see: `✅ Dashboard connected to backend successfully!`

### 5.3 Test Agent Connection

1. Agent should show: `✅ Authenticated and connected to backend successfully!`
2. Dashboard should show your device in the device list

### 5.4 Test Features

- [ ] Device authentication works
- [ ] Commands execute successfully
- [ ] System stats update every 3 seconds
- [ ] File transfer works
- [ ] Theme toggle works
- [ ] Multi-device execution works

---

## 🔧 Step 6: Post-Deployment Configuration

### 6.1 Update README

Replace `README.md` with `README_PRODUCTION.md`:

```bash
cp README_PRODUCTION.md README.md
git add README.md
git commit -m "Update README for production"
git push
```

### 6.2 Add Custom Domain (Optional)

#### For Dashboard (Vercel)

1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Follow DNS configuration instructions

#### For Backend (Render)

1. Go to Render dashboard
2. Select your service
3. Go to "Settings" → "Custom Domain"
4. Add your custom domain
5. Update DNS records

### 6.3 Update Environment Variables

If you added custom domains, update:

```env
NEXT_PUBLIC_BACKEND_WS=wss://api.yourdomain.com
```

And for agent:

```bash
export BACKEND_URL=wss://api.yourdomain.com
```

---

## 📊 Step 7: Monitoring

### 7.1 Render Monitoring

1. Go to Render dashboard
2. Select your service
3. View logs and metrics

### 7.2 Vercel Monitoring

1. Go to Vercel dashboard
2. Select your project
3. View analytics and logs

### 7.3 Set Up Alerts (Optional)

- Configure uptime monitoring (UptimeRobot, Pingdom)
- Set up error tracking (Sentry)
- Enable email notifications

---

## 🎉 Success Checklist

- [ ] Backend deployed and accessible
- [ ] Dashboard deployed and accessible
- [ ] Agent connects to production backend
- [ ] Device appears in dashboard
- [ ] Commands execute successfully
- [ ] System stats update in real-time
- [ ] File transfer works
- [ ] All features functional
- [ ] No console errors
- [ ] SSL/TLS enabled (wss://)
- [ ] Documentation updated
- [ ] Monitoring configured

---

## 🐛 Troubleshooting

### Backend Not Accessible

1. Check Render logs for errors
2. Verify build completed successfully
3. Check if service is running
4. Verify port configuration

### Dashboard Can't Connect

1. Verify `NEXT_PUBLIC_BACKEND_WS` is correct
2. Check browser console for errors
3. Ensure backend is accessible
4. Verify using `wss://` not `ws://`

### Agent Can't Connect

1. Verify `BACKEND_URL` environment variable
2. Check if backend is accessible
3. Verify password is correct
4. Check agent logs for errors

---

## 💰 Cost Breakdown

### Free Tier (Render + Vercel)

- Backend (Render Free): $0/month
  - Spins down after 15 minutes of inactivity
  - 750 hours/month free
- Dashboard (Vercel): $0/month
  - Unlimited bandwidth
  - Automatic SSL
- **Total: $0/month**

### Paid Tier (Better Performance)

- Backend (Render Starter): $7/month
  - Always on
  - Better performance
- Dashboard (Vercel): $0/month
- **Total: $7/month**

---

## 📝 Notes

### Free Tier Limitations

- Backend spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Suitable for testing and personal use

### Upgrade Recommendations

- For production use: Upgrade to Render Starter ($7/month)
- For high traffic: Consider dedicated hosting
- For enterprise: Self-hosted on VPS/cloud

---

## 🔄 Updating Deployment

### Update Backend

```bash
git add backend/
git commit -m "Update backend"
git push
```

Render will automatically redeploy.

### Update Dashboard

```bash
git add dashboard/
git commit -m "Update dashboard"
git push
```

Vercel will automatically redeploy.

### Update Agent

Distribute new agent version to users.

---

## 🎯 Next Steps

1. Share dashboard URL with users
2. Distribute agent to devices
3. Monitor usage and performance
4. Collect feedback
5. Plan new features
6. Scale as needed

---

## 🌟 You're Live!

Your Vortix system is now deployed and accessible worldwide!

- **Dashboard**: https://vortix-dashboard.vercel.app
- **Backend**: wss://vortix-backend.onrender.com
- **Status**: ✅ Production Ready

Share your dashboard URL and start controlling devices remotely!

---

## 📞 Support

Need help?

1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Review [WEBSOCKET_CONNECTION_FIX.md](WEBSOCKET_CONNECTION_FIX.md)
3. Check platform documentation (Render, Vercel)
4. Open an issue on GitHub

---

**Congratulations! 🎉 Your Vortix system is now live in production!**
