# Vortix - Production Deployment Guide

## Overview

Vortix consists of three components:

1. **Backend** - WebSocket server (Node.js)
2. **Dashboard** - Web interface (Next.js)
3. **Agent** - Device client (Node.js)

## Environment Variables

### Backend

- `PORT` - Server port (default: 8080)

### Dashboard

- `NEXT_PUBLIC_BACKEND_WS` - Backend WebSocket URL
  - Local: `ws://localhost:8080`
  - Production: `wss://your-backend-domain.com`

### Agent

- `BACKEND_URL` - Backend WebSocket URL
  - Local: `ws://localhost:8080`
  - Production: `wss://your-backend-domain.com`

---

## Deployment Options

### Option 1: Render.com (Recommended)

#### Backend Deployment

1. **Create New Web Service**
   - Connect your GitHub repository
   - Select `backend` folder as root directory
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables**
   - `PORT` is automatically set by Render

3. **Get Backend URL**
   - After deployment, note your backend URL
   - Example: `wss://vortix-backend.onrender.com`

#### Dashboard Deployment

1. **Create New Static Site**
   - Connect your GitHub repository
   - Select `dashboard` folder as root directory
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`

2. **Environment Variables**
   - `NEXT_PUBLIC_BACKEND_WS` = `wss://your-backend-url.onrender.com`

---

### Option 2: Vercel (Dashboard) + Render (Backend)

#### Backend on Render

Same as Option 1

#### Dashboard on Vercel

1. **Import Project**
   - Connect GitHub repository
   - Select `dashboard` folder

2. **Environment Variables**
   - `NEXT_PUBLIC_BACKEND_WS` = `wss://your-backend-url.onrender.com`

3. **Deploy**
   - Vercel will automatically build and deploy

---

### Option 3: Railway

#### Backend

1. **New Project**
   - Connect GitHub repository
   - Select `backend` folder

2. **Environment Variables**
   - Railway automatically sets `PORT`

3. **Deploy**
   - Railway will build and deploy automatically

#### Dashboard

1. **New Project**
   - Connect GitHub repository
   - Select `dashboard` folder

2. **Environment Variables**
   - `NEXT_PUBLIC_BACKEND_WS` = `wss://your-backend-url.railway.app`

3. **Deploy**

---

### Option 4: Self-Hosted (VPS/Cloud)

#### Requirements

- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt)

#### Backend Setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/vortix.git
cd vortix/backend

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Start backend
pm2 start server.js --name vortix-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Dashboard Setup

```bash
cd ../dashboard

# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2
pm2 start npm --name vortix-dashboard -- start

# Save configuration
pm2 save
```

#### Nginx Configuration

```nginx
# Backend (WebSocket)
server {
    listen 80;
    server_name backend.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Dashboard
server {
    listen 80;
    server_name dashboard.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d backend.yourdomain.com -d dashboard.yourdomain.com
```

---

## Agent Configuration

### For Production

1. **Set Backend URL**

   ```bash
   # Windows
   set BACKEND_URL=wss://your-backend-domain.com

   # Linux/Mac
   export BACKEND_URL=wss://your-backend-domain.com
   ```

2. **Set Password**

   ```bash
   cd agent
   node agent.js login
   # Enter password
   ```

3. **Start Agent**

   ```bash
   node agent.js start
   ```

4. **Enable Auto-Start** (Optional)
   ```bash
   node agent.js enable-autostart
   ```

---

## Environment Files

### Backend (.env)

```env
PORT=8080
```

### Dashboard (.env.local)

```env
# Local Development
NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080

# Production (update after backend deployment)
# NEXT_PUBLIC_BACKEND_WS=wss://your-backend-domain.com
```

### Agent

No .env file needed. Use environment variable:

```bash
BACKEND_URL=wss://your-backend-domain.com
```

---

## Testing Deployment

### 1. Test Backend

```bash
# Check if backend is accessible
curl https://your-backend-domain.com

# Test WebSocket (using wscat)
npm install -g wscat
wscat -c wss://your-backend-domain.com?type=dashboard
```

### 2. Test Dashboard

- Open: https://your-dashboard-domain.com
- Check browser console for connection messages
- Should see: "✅ Dashboard connected to backend successfully!"

### 3. Test Agent

```bash
# Set backend URL
export BACKEND_URL=wss://your-backend-domain.com

# Start agent
cd agent
node agent.js start

# Should see: "✅ Authenticated and connected to backend successfully!"
```

---

## Security Considerations

### 1. Use HTTPS/WSS in Production

- Always use `wss://` (WebSocket Secure) in production
- Never use `ws://` in production

### 2. Strong Passwords

- Use strong passwords for device authentication
- Change default passwords

### 3. Firewall Rules

- Only expose necessary ports (80, 443)
- Block direct access to backend port (8080)

### 4. Environment Variables

- Never commit `.env` files to git
- Use platform-specific secret management

### 5. Rate Limiting

- Consider adding rate limiting to backend
- Prevent abuse and DDoS attacks

---

## Monitoring

### PM2 Monitoring (Self-Hosted)

```bash
# View logs
pm2 logs vortix-backend
pm2 logs vortix-dashboard

# Monitor resources
pm2 monit

# Restart services
pm2 restart vortix-backend
pm2 restart vortix-dashboard
```

### Platform Monitoring

- Render: Built-in logs and metrics
- Vercel: Analytics and logs dashboard
- Railway: Logs and metrics in dashboard

---

## Troubleshooting

### Backend Not Accessible

1. Check if service is running
2. Verify firewall rules
3. Check SSL certificate
4. Review backend logs

### Dashboard Can't Connect

1. Verify `NEXT_PUBLIC_BACKEND_WS` is correct
2. Check browser console for errors
3. Ensure backend is accessible
4. Verify CORS settings if needed

### Agent Can't Connect

1. Verify `BACKEND_URL` environment variable
2. Check if backend is accessible from agent's network
3. Verify password is correct
4. Check agent logs for errors

---

## Scaling

### Backend Scaling

- Use load balancer for multiple backend instances
- Implement Redis for session management
- Use sticky sessions for WebSocket connections

### Dashboard Scaling

- Static site, scales automatically on most platforms
- Use CDN for better performance

### Agent Scaling

- Each device runs its own agent
- No special scaling needed

---

## Backup and Recovery

### Configuration Backup

```bash
# Backup agent config
cp ~/.vortix-config.json ~/vortix-config-backup.json

# Backup environment files
cp dashboard/.env.local dashboard/.env.local.backup
```

### Database (Future)

If you add a database:

- Regular automated backups
- Point-in-time recovery
- Backup retention policy

---

## Cost Estimates

### Render.com (Free Tier)

- Backend: Free (with limitations)
- Dashboard: Free (static site)
- Total: $0/month

### Render.com (Paid)

- Backend: $7/month (Starter)
- Dashboard: Free
- Total: $7/month

### Vercel + Render

- Dashboard (Vercel): Free
- Backend (Render): $7/month
- Total: $7/month

### Self-Hosted (VPS)

- DigitalOcean Droplet: $6/month
- Domain: $12/year
- SSL: Free (Let's Encrypt)
- Total: ~$7/month

---

## Support

For deployment issues:

1. Check logs first
2. Review environment variables
3. Test connectivity
4. Check firewall/security settings
5. Review platform-specific documentation

---

## Quick Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Backend URL noted (wss://...)
- [ ] Dashboard environment variable set
- [ ] Dashboard deployed and accessible
- [ ] Agent configured with backend URL
- [ ] Agent password set
- [ ] Test connection from dashboard
- [ ] Test agent connection
- [ ] SSL/TLS enabled (production)
- [ ] Monitoring set up
- [ ] Backups configured
