# 🚀 Render Backend Environment Setup

## ❌ Current Error
```
Error: Configure CLERK_SECRET_KEY (sk_test_ or sk_live_) or CLERK_JWT_KEY
```

## ✅ Required Environment Variables for Render

You need to add these environment variables to your Render backend:

### 1. CLERK_SECRET_KEY (Required)
**Value:** `sk_test_YOUR_CLERK_SECRET_KEY_HERE`

This is your Clerk authentication key from your dashboard `.env.local` file.

### 2. GROQ_API_KEY (Required for AI Planning)
**Value:** `gsk_YOUR_GROQ_API_KEY_HERE`

This enables AI command planning in the dashboard.

### 3. NODE_ENV (Recommended)
**Value:** `production`

Sets the environment to production mode.

### 4. PORT (Optional - Render sets this automatically)
**Value:** `8080` (or leave blank)

Render automatically sets this, but 8080 is the fallback.

---

## 📋 Step-by-Step: Add Environment Variables to Render

### Method 1: Via Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Open: https://dashboard.render.com
   - Login to your account

2. **Find Your Backend Service**
   - Click on your **"vortix"** backend service
   - (The one at `vortix.onrender.com`)

3. **Navigate to Environment Tab**
   - In the left sidebar, click **"Environment"**

4. **Add Variables One by One**

   Click **"Add Environment Variable"** and add each:

   **Variable 1:**
   ```
   Key:   CLERK_SECRET_KEY
   Value: sk_test_YOUR_CLERK_SECRET_KEY_HERE
   ```

   **Variable 2:**
   ```
   Key:   GROQ_API_KEY
   Value: gsk_YOUR_GROQ_API_KEY_HERE
   ```

   **Variable 3:**
   ```
   Key:   NODE_ENV
   Value: production
   ```

5. **Save Changes**
   - Click **"Save Changes"** button
   - Render will automatically redeploy (takes 1-2 minutes)

6. **Watch the Logs**
   - Go to **"Logs"** tab
   - Wait for: `Backend running on port 8080`
   - Should see: `Health check: http://localhost:8080/health`

---

### Method 2: Via Render CLI

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Navigate to your service
cd backend

# Add environment variables
render env set CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY_HERE
render env set GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
render env set NODE_ENV=production

# Redeploy
render deploy
```

---

## 🔍 Verify Setup

After deployment completes:

### 1. Check Render Logs
Look for these messages in the logs:
```
✅ Backend running on port 8080
✅ Health check: http://localhost:8080/health
```

### 2. Test Health Endpoint
Visit in your browser:
```
https://vortix.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "devices": 0,
  "dashboards": 0,
  "uptime": 123.45
}
```

### 3. Check Environment Variables
In Render Dashboard → Environment, you should see:
```
CLERK_SECRET_KEY          sk_test_btxOI0MF5AapuVk... (hidden)
GROQ_API_KEY              gsk_We3UWz93ywuPXeHJBP... (hidden)
NODE_ENV                  production
```

---

## 🧪 Test End-to-End

Once backend is running:

### 1. Start Your Agent
```powershell
cd agent
node agent.js start
```

Expected output:
```
Device: DESKTOP-FF97MLA
Platform: win32 (Windows)
Connecting to backend...
Backend URL: wss://vortix.onrender.com
✅ Authenticated and connected to backend successfully!
Connected to: wss://vortix.onrender.com
```

### 2. Test Dashboard
1. Go to: https://vortixai.vercel.app
2. Sign in with Clerk
3. Go to dashboard
4. You should see your device online
5. Try command: "show me system info"
6. Should work without errors! ✅

---

## 🐛 Troubleshooting

### Error: "Configure CLERK_SECRET_KEY"
**Solution:** Add `CLERK_SECRET_KEY` to Render environment variables

### Error: "AI planning failed"
**Solution:** Add `GROQ_API_KEY` to Render environment variables

### Backend keeps restarting
**Check logs for errors:**
1. Go to Render Dashboard → Your Service → Logs
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Port conflicts
   - Dependency errors

### Environment variables not working
**Verify:**
1. No extra spaces or quotes in values
2. Click "Save Changes" after adding
3. Wait for redeploy to complete
4. Check logs for confirmation

### Agent can't connect
**Verify:**
1. Backend is running (check Render logs)
2. Backend URL in agent: `wss://vortix.onrender.com`
3. Device password is set: `vortix login`
4. Firewall not blocking WebSocket

---

## 📊 Complete Environment Variables Checklist

- [ ] CLERK_SECRET_KEY added to Render
- [ ] GROQ_API_KEY added to Render
- [ ] NODE_ENV set to production
- [ ] Render deployment successful
- [ ] Backend logs show "Backend running on port 8080"
- [ ] Health endpoint returns {"status":"ok"}
- [ ] Agent connects successfully
- [ ] Dashboard shows device online
- [ ] AI commands work without errors

---

## 🎯 Quick Copy-Paste Values

**For Render Environment Variables:**

```
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY_HERE
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
NODE_ENV=production
```

> **Note:** Get your actual keys from:
> - CLERK_SECRET_KEY: From `dashboard/.env.local` file
> - GROQ_API_KEY: From your dashboard `.env` or `.env.local` file

---

## 📞 Need Help?

If you're still having issues:

1. **Check Render Status:** https://status.render.com
2. **View Logs:** Render Dashboard → Your Service → Logs
3. **Test Locally:** Run backend with correct .env file
4. **Verify Keys:** Check Clerk dashboard for correct keys

---

**Once you add these environment variables, your backend will deploy successfully!** 🚀
