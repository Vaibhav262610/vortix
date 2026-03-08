# 🚨 FIX ALL CONNECTION ISSUES NOW

## The Problem

- Agent stuck at "Connecting to backend..."
- Dashboard shows "WebSocket error"
- Nothing connects to anything

## The Root Cause

Both the agent and dashboard were configured to connect to the production server
(`wss://vortix.onrender.com`) instead of your local backend
(`ws://localhost:8080`).

---

## ✅ THE FIX (ONE COMMAND)

```bash
COMPLETE_FIX.bat
```

This ONE script fixes EVERYTHING:

- ✅ Sets dashboard to connect to localhost
- ✅ Sets agent to connect to localhost
- ✅ Creates default password (vortix123)
- ✅ Stops conflicting services
- ✅ Starts backend, agent, and dashboard
- ✅ Opens browser automatically

**Just run it and wait 30 seconds!**

---

## What Was Fixed

### 1. Dashboard Connection

**Before:**

```javascript
const backendWS =
	process.env.NEXT_PUBLIC_BACKEND_WS || "wss://vortix.onrender.com";
```

**After:**

```javascript
const backendWS = process.env.NEXT_PUBLIC_BACKEND_WS || "ws://localhost:8080";
```

### 2. Agent Connection

**Before:**

```javascript
const BACKEND_URL = process.env.BACKEND_URL || "wss://vortix.onrender.com";
```

**After:**

```javascript
const BACKEND_URL = process.env.BACKEND_URL || "ws://localhost:8080";
```

### 3. Environment Files

Created/fixed:

- `dashboard/.env.local` → `NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080`
- `~/.vortix-config.json` → `{"password":"vortix123"}`

---

## Verify It's Working

### Backend Terminal:

```
Backend running on port 8080
```

### Agent Terminal:

```
Device: VAIBHAV-PC
Platform: win32 (Windows)
Connecting to backend...
Backend URL: ws://localhost:8080
Attempting connection to: ws://localhost:8080?token=...
✅ Authenticated and connected to backend successfully!
Connected to: ws://localhost:8080
```

### Dashboard Terminal:

```
Ready on http://localhost:3000
```

### Browser Console (F12):

```
🔌 WebSocket Connection Info:
Using Backend URL: ws://localhost:8080
✅ Dashboard connected to backend successfully!
```

---

## Manual Steps (If Script Doesn't Work)

### 1. Fix Agent

```bash
cd agent
node agent.js login
# Enter password: vortix123
node agent.js start
```

### 2. Fix Dashboard

```bash
cd dashboard
echo NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080 > .env.local
npm run dev
```

### 3. Start Backend

```bash
cd backend
npm start
```

---

## Quick Commands

**Fix everything:**

```bash
COMPLETE_FIX.bat
```

**Fix agent only:**

```bash
fix-agent-connection.bat
```

**Fix dashboard only:**

```bash
fix-connection.bat
```

**Diagnose issues:**

```bash
diagnose-connection.bat
```

---

## Default Credentials

**Device Password:** `vortix123`

Use this password in the dashboard when authenticating your device.

To change it:

```bash
cd agent
node agent.js login
# Enter new password
```

---

## Success Indicators

✅ **Backend:** Shows "Backend running on port 8080" ✅ **Agent:** Shows "✅
Authenticated and connected to backend successfully!" ✅ **Dashboard:** Shows
"Ready on http://localhost:3000" ✅ **Browser:** Shows "✅ Dashboard connected
to backend successfully!" ✅ **Device List:** Shows your device (VAIBHAV-PC) ✅
**System Stats:** Updates every 3 seconds

---

## Still Having Issues?

### Issue: Agent won't start

**Solution:**

```bash
cd agent
node agent.js login
# Set password: vortix123
node agent.js start
```

### Issue: Backend won't start

**Solution:**

```bash
# Kill anything on port 8080
netstat -ano | findstr :8080
taskkill /F /PID <PID>

# Start backend
cd backend
npm start
```

### Issue: Dashboard won't connect

**Solution:**

```bash
cd dashboard
# Delete .next folder
rmdir /s /q .next
# Recreate .env.local
echo NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080 > .env.local
# Restart
npm run dev
```

---

## Files Modified

1. `agent/agent.js` - Changed default backend URL to localhost
2. `dashboard/app/dashboard/page.tsx` - Changed default backend URL to localhost
3. `dashboard/.env.local` - Created with localhost URL
4. `~/.vortix-config.json` - Created with default password

---

## 🎉 You're Done!

After running `COMPLETE_FIX.bat`, everything should work:

- Backend running on port 8080
- Agent connected and sending heartbeats
- Dashboard connected and showing devices
- System stats updating every 3 seconds
- Commands executing successfully

**Just run `COMPLETE_FIX.bat` and you're good to go!**
