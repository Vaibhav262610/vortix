# Deploy Backend to Render.com (Free Alternative)

Your Railway trial expired. Let's use Render.com instead - it's free!

## 🚀 Deploy to Render (5 minutes)

### Step 1: Go to Render

Visit: https://render.com

### Step 2: Sign Up / Login

- Sign up with GitHub (recommended)
- Or use email

### Step 3: Create Web Service

1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository (or use "Deploy from Git URL")

### Step 4: Configure Service

**If using GitHub:**

- Select your repository
- Click "Connect"

**If using Git URL:**

- Enter: `https://github.com/yourusername/vortix.git` (or your repo URL)
- Click "Continue"

### Step 5: Settings

Fill in these details:

- **Name**: `vortix-backend`
- **Region**: Choose closest to you
- **Branch**: `main` (or your branch name)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Step 6: Deploy

Click "Create Web Service"

Render will:

1. Clone your repo
2. Install dependencies
3. Start the server
4. Give you a URL

### Step 7: Get Your URL

After deployment completes, you'll see:

```
Your service is live at https://vortix-backend.onrender.com
```

### Step 8: Update Agent

Edit `agent/agent.js` (line ~30):

```javascript
const BACKEND_URL =
	process.env.BACKEND_URL || "wss://vortix-backend.onrender.com";
```

### Step 9: Update Dashboard

Edit `dashboard/.env.local`:

```
NEXT_PUBLIC_BACKEND_WS=wss://vortix-backend.onrender.com
```

### Step 10: Republish

```bash
# Update CLI
cd cli_vortix
npm version patch
npm publish

# Redeploy dashboard
cd ../dashboard
vercel --prod
```

## ✅ Test

```bash
# Test backend
curl https://vortix-backend.onrender.com

# Test agent
vortix start
```

## 📝 Notes

- Render free tier: 750 hours/month
- Service sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds to wake up
- Perfect for hobby projects!

## 🔗 Render Dashboard

Monitor your service at: https://dashboard.render.com

---

**Render is free and works great for this project!** 🎉
