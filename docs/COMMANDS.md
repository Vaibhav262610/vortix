# Vortix Command Reference

## CLI Commands

### Installation

```bash
# Install globally
npm install -g vortix

# Uninstall
npm uninstall -g vortix

# Update to latest version
npm update -g vortix

# Check installed version
npm list -g vortix
```

### Agent Commands

```bash
# Login and register device (first time)
vortix login

# Start agent on current device
vortix start

# Show help
vortix help
```

### Backend Commands

```bash
# Start backend server
vortix backend

# Start backend with custom port (not implemented yet)
# vortix backend --port 9000
```

---

## Developer Commands

### Publishing to npm

```bash
# Login to npm
npm login

# Check who you're logged in as
npm whoami

# Publish package (first time)
cd cli_vortix
npm publish --access public

# Update version and republish
npm version patch    # 1.0.0 -> 1.0.1
npm version minor    # 1.0.0 -> 1.1.0
npm version major    # 1.0.0 -> 2.0.0
npm publish

# View package info
npm info vortix

# View package stats
npm view vortix
```

### Backend Deployment (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up

# View logs
railway logs

# Get domain
railway domain

# Open in browser
railway open
```

### Dashboard Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (development)
cd dashboard
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel list

# Remove deployment
vercel remove [deployment-url]
```

---

## Testing Commands

### Local Testing

```bash
# Test CLI locally without publishing
cd cli_vortix
npm link
vortix help

# Unlink when done
npm unlink -g vortix

# Test backend locally
cd backend
node server.js

# Test agent locally
cd agent
node agent.js start

# Test dashboard locally
cd dashboard
npm run dev
```

### WebSocket Testing

```bash
# Install wscat
npm install -g wscat

# Test backend connection
wscat -c ws://localhost:8080?token=test-token

# Test production backend
wscat -c wss://your-backend.railway.app?token=test-token

# Send test message
> {"type":"HEARTBEAT"}
```

---

## Maintenance Commands

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update <package-name>

# Install latest versions
npm install <package-name>@latest
```

### Clean Install

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Git Commands

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/username/vortix.git

# Push
git push -u origin main

# Create .gitignore
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo ".next/" >> .gitignore
```

---

## Monitoring Commands

### Check Service Status

```bash
# Check if backend is running
curl https://your-backend.railway.app

# Check npm package
npm view vortix

# Check download stats
npm info vortix

# View Railway logs
railway logs --tail

# View Vercel logs
vercel logs
```

### Process Management

```bash
# Find process using port 8080
# Windows
netstat -ano | findstr :8080

# Mac/Linux
lsof -i :8080

# Kill process
# Windows
taskkill /PID <pid> /F

# Mac/Linux
kill -9 <pid>
```

---

## Troubleshooting Commands

### npm Issues

```bash
# Clear npm cache
npm cache clean --force

# Verify npm cache
npm cache verify

# Check npm configuration
npm config list

# Reset npm configuration
npm config delete <key>

# Fix permissions (Mac/Linux)
sudo chown -R $(whoami) ~/.npm
```

### Node Issues

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Update npm
npm install -g npm@latest

# List globally installed packages
npm list -g --depth=0
```

### Railway Issues

```bash
# Check Railway status
railway status

# View environment variables
railway variables

# Restart service
railway restart

# Delete project
railway delete
```

### Vercel Issues

```bash
# Check Vercel status
vercel whoami

# View environment variables
vercel env ls

# Pull environment variables
vercel env pull

# Redeploy
vercel --prod --force
```

---

## Environment Variables

### Dashboard (.env.local)

```bash
# Create environment file
echo "NEXT_PUBLIC_BACKEND_WS=wss://your-backend.railway.app" > .env.local

# View environment variables
cat .env.local

# Windows
type .env.local
```

### Backend (Railway)

```bash
# Set environment variable
railway variables set KEY=value

# View all variables
railway variables

# Delete variable
railway variables delete KEY
```

---

## Useful Aliases (Optional)

Add to your shell profile (.bashrc, .zshrc, etc.):

```bash
# Quick commands
alias vx='vortix'
alias vxs='vortix start'
alias vxb='vortix backend'
alias vxh='vortix help'

# Development
alias vxdev='cd ~/vortix && code .'
alias vxlog='railway logs --tail'
alias vxdeploy='cd cli_vortix && npm version patch && npm publish'

# Testing
alias vxtest='wscat -c ws://localhost:8080?token=test'
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                  VORTIX QUICK REFERENCE                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INSTALL:        npm install -g vortix                  │
│  START AGENT:    vortix start                           │
│  START BACKEND:  vortix backend                         │
│  HELP:           vortix help                            │
│                                                         │
│  PUBLISH:        npm publish --access public            │
│  DEPLOY BACKEND: railway up                             │
│  DEPLOY DASH:    vercel --prod                          │
│                                                         │
│  TEST WS:        wscat -c ws://localhost:8080           │
│  VIEW LOGS:      railway logs --tail                    │
│  CHECK STATUS:   npm info vortix                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Emergency Commands

### Stop Everything

```bash
# Stop agent
Ctrl+C (in terminal running vortix start)

# Stop backend
Ctrl+C (in terminal running vortix backend)

# Stop Railway service
railway down

# Stop Vercel deployment
vercel remove [deployment-url]
```

### Rollback

```bash
# Rollback npm package
npm unpublish vortix@1.0.1
npm publish  # republish previous version

# Rollback Railway deployment
railway rollback

# Rollback Vercel deployment
vercel rollback [deployment-url]
```

### Complete Reset

```bash
# Remove from npm
npm unpublish vortix --force

# Delete Railway project
railway delete

# Delete Vercel project
vercel remove --yes

# Clean local installation
npm uninstall -g vortix
rm -rf node_modules
```

---

**For more details, see [QUICK_START.md](QUICK_START.md) and
[DEPLOYMENT.md](DEPLOYMENT.md)**
