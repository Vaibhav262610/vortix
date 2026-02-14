# Vortix Deployment Checklist

## ✅ Pre-Publishing Checklist

### 1. Update Package Information

- [ ] Edit `cli_vortix/package.json`:
  - [ ] Update `author` field with your name and email
  - [ ] Update `repository.url` with your GitHub URL
  - [ ] Verify `version` is correct (start with 1.0.0)
  - [ ] Check `name` is available on npm: `npm search vortix`

### 2. Test Locally

- [ ] Run `cd cli_vortix && npm install`
- [ ] Run `npm link` to test globally
- [ ] Test command: `vortix help`
- [ ] Test command: `vortix backend` (Ctrl+C to stop)
- [ ] Unlink: `npm unlink -g vortix`

### 3. Create npm Account

- [ ] Sign up at https://www.npmjs.com/signup
- [ ] Verify email
- [ ] Login: `npm login`
- [ ] Verify: `npm whoami`

---

## 📦 Publishing to npm

- [ ] Navigate: `cd cli_vortix`
- [ ] Install: `npm install`
- [ ] Publish: `npm publish --access public`
- [ ] Verify: `npm info vortix`
- [ ] Test install: `npm install -g vortix` (on different machine)

---

## ☁️ Deploy Backend

### Railway (Recommended)

- [ ] Install CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Navigate: `cd backend`
- [ ] Initialize: `railway init`
- [ ] Deploy: `railway up`
- [ ] Get URL: `railway domain`
- [ ] Save URL: `___________________________`

### OR Render.com

- [ ] Go to https://render.com
- [ ] Create "Web Service"
- [ ] Connect GitHub repo
- [ ] Set root directory: `backend`
- [ ] Set build command: `npm install`
- [ ] Set start command: `node server.js`
- [ ] Deploy
- [ ] Save URL: `___________________________`

---

## 🌐 Deploy Dashboard

### Vercel (Recommended)

- [ ] Install CLI: `npm install -g vercel`
- [ ] Navigate: `cd dashboard`
- [ ] Create `.env.local`:
  ```
  NEXT_PUBLIC_BACKEND_WS=wss://YOUR_BACKEND_URL
  ```
- [ ] Deploy: `vercel`
- [ ] Deploy to production: `vercel --prod`
- [ ] Save URL: `___________________________`

### OR Vercel via GitHub

- [ ] Go to https://vercel.com
- [ ] Import GitHub repo
- [ ] Set root directory: `dashboard`
- [ ] Add environment variable:
  - Key: `NEXT_PUBLIC_BACKEND_WS`
  - Value: `wss://YOUR_BACKEND_URL`
- [ ] Deploy
- [ ] Save URL: `___________________________`

---

## 🔧 Update Code with Production URLs

### Update Agent

- [ ] Edit `agent/agent.js` (around line 30)
- [ ] Change:
  ```javascript
  const ws = new WebSocket(`ws://localhost:8080?token=${token}`);
  ```
  To:
  ```javascript
  const ws = new WebSocket(`wss://YOUR_BACKEND_URL?token=${token}`);
  ```
- [ ] Republish to npm:
  ```bash
  cd cli_vortix
  npm version patch
  npm publish
  ```

### Update Dashboard (if not using env variable)

- [ ] Edit dashboard WebSocket connection code
- [ ] Use environment variable: `process.env.NEXT_PUBLIC_BACKEND_WS`
- [ ] Redeploy: `vercel --prod`

---

## 🧪 Testing

### Test Backend

- [ ] Install wscat: `npm install -g wscat`
- [ ] Test: `wscat -c wss://YOUR_BACKEND_URL?token=test`
- [ ] Should connect without errors

### Test Agent

- [ ] Install: `npm install -g vortix`
- [ ] Run: `vortix start`
- [ ] Should show: "Authenticated and connected to backend"
- [ ] Check backend logs for connection

### Test Dashboard

- [ ] Open dashboard URL in browser
- [ ] Should see device list (may be empty)
- [ ] Open browser console, check for WebSocket connection
- [ ] Start agent, verify device appears as "online"

### End-to-End Test

- [ ] Open dashboard
- [ ] Start agent on a device: `vortix start`
- [ ] Device appears as "online" in dashboard
- [ ] Send test command from dashboard (e.g., "echo hello")
- [ ] Verify command executes on agent
- [ ] Check logs in dashboard

---

## 📝 Documentation

- [ ] Update README.md with:

  - [ ] Installation instructions
  - [ ] Your deployed URLs
  - [ ] Usage examples
  - [ ] Screenshots (optional)

- [ ] Create GitHub repository
  - [ ] Push code
  - [ ] Add README
  - [ ] Add LICENSE file
  - [ ] Add .gitignore

---

## 🔐 Security (Before Production)

- [ ] Implement proper authentication (not just hostname tokens)
- [ ] Add rate limiting to backend
- [ ] Validate commands before execution
- [ ] Add HTTPS/WSS enforcement
- [ ] Add user permissions system
- [ ] Add command approval workflow
- [ ] Add audit logging

---

## 📊 Monitoring Setup

- [ ] Set up backend monitoring (Railway/Render dashboard)
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Create alerts for downtime

---

## 🎉 Launch

- [ ] Announce on social media
- [ ] Post on Reddit (r/node, r/javascript, r/SideProject)
- [ ] Share on Twitter/X
- [ ] Post on Product Hunt
- [ ] Add to your portfolio

---

## 📈 Post-Launch

- [ ] Monitor npm download stats:
      https://npm-stat.com/charts.html?package=vortix
- [ ] Respond to GitHub issues
- [ ] Update documentation based on user feedback
- [ ] Plan next features

---

## 🆘 Emergency Contacts

- npm support: https://www.npmjs.com/support
- Railway support: https://railway.app/help
- Vercel support: https://vercel.com/support
- Render support: https://render.com/docs

---

## 📌 Important URLs

| Service     | URL                                  | Status |
| ----------- | ------------------------------------ | ------ |
| npm Package | https://www.npmjs.com/package/vortix | [ ]    |
| Backend     | wss://******\_\_\_\_******           | [ ]    |
| Dashboard   | https://******\_\_\_\_******         | [ ]    |
| GitHub Repo | https://github.com/________/vortix   | [ ]    |

---

## Version History

- [ ] v1.0.0 - Initial release
- [ ] v1.0.1 - Bug fixes
- [ ] v1.1.0 - New features
- [ ] v2.0.0 - Major update

---

**Last Updated**: ******\_\_\_****** **Deployed By**: ******\_\_\_******
