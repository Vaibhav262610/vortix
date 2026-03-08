# WebSocket Connection Error - Complete Fix Guide

## Problem

Dashboard shows: `❌ WebSocket error: {}` This means the dashboard cannot
connect to the backend server.

---

## Quick Fix (Run This First)

```bash
fix-connection.bat
```

This script will:

1. ✅ Verify .env.local exists with correct settings
2. ✅ Check if backend is running
3. ✅ Restart dashboard with correct environment variables

---

## Manual Fix Steps

### Step 1: Verify Backend is Running

**Check if port 8080 is open:**

```bash
netstat -an | findstr ":8080"
```

**If nothing shows up, start the backend:**

```bash
cd backend
npm start
```

**You should see:**

```
Backend running on port 8080
```

### Step 2: Verify Environment Variable

**Check dashboard/.env.local exists:**

```bash
cd dashboard
type .env.local
```

**Should contain:**

```
NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080
```

**If file doesn't exist or is wrong, create/fix it:**

```bash
echo NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080 > .env.local
```

### Step 3: Restart Dashboard

**IMPORTANT:** You MUST restart the dashboard after changing .env.local

1. Stop the current dashboard (Ctrl+C in terminal)
2. Start it again:

```bash
cd dashboard
npm run dev
```

3. Wait for: `Ready on http://localhost:3000`
4. Refresh browser (F5)

### Step 4: Verify Connection

**Open browser console (F12) and look for:**

```
🔌 WebSocket Connection Info:
Environment Variable: ws://localhost:8080
Using Backend URL: ws://localhost:8080
🔄 Attempting to connect to: ws://localhost:8080?type=dashboard
✅ Dashboard connected to backend successfully!
```

---

## Diagnosis Tools

### Tool 1: Check Services

```bash
diagnose-connection.bat
```

Shows:

- ✅/❌ Backend status (port 8080)
- ✅/❌ Dashboard status (port 3000)
- Connection test results

### Tool 2: Check Ports Manually

```bash
netstat -an | findstr ":8080"
netstat -an | findstr ":3000"
```

### Tool 3: Browser Console

Press F12 in browser and check Console tab for:

- Connection attempts
- Error messages
- Environment variable values

---

## Common Issues & Solutions

### Issue 1: Backend Not Running

**Symptom:** Port 8080 is closed

**Solution:**

```bash
cd backend
npm start
```

### Issue 2: Wrong Environment Variable

**Symptom:** Console shows `Using Backend URL: wss://vortix.onrender.com`

**Solution:**

1. Edit `dashboard/.env.local`
2. Add: `NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080`
3. Restart dashboard

### Issue 3: Dashboard Not Picking Up Environment Variable

**Symptom:** .env.local is correct but dashboard still uses wrong URL

**Solution:**

1. Stop dashboard completely (Ctrl+C)
2. Delete `.next` folder: `rmdir /s /q .next`
3. Restart: `npm run dev`

### Issue 4: Firewall Blocking Connection

**Symptom:** Backend running but dashboard can't connect

**Solution:**

1. Check Windows Firewall
2. Allow Node.js through firewall
3. Or temporarily disable firewall for testing

### Issue 5: Port Already in Use

**Symptom:** Backend won't start, says port 8080 in use

**Solution:**

```bash
# Find what's using port 8080
netstat -ano | findstr ":8080"

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Restart backend
cd backend
npm start
```

---

## Verification Checklist

Run through this checklist:

- [ ] Backend terminal shows "Backend running on port 8080"
- [ ] Dashboard terminal shows "Ready on http://localhost:3000"
- [ ] File `dashboard/.env.local` exists
- [ ] File contains `NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080`
- [ ] Dashboard was restarted after creating/editing .env.local
- [ ] Browser console shows "Using Backend URL: ws://localhost:8080"
- [ ] Browser console shows "✅ Dashboard connected to backend successfully!"
- [ ] No firewall blocking ports 8080 or 3000

---

## Complete Restart Procedure

If nothing else works, do a complete restart:

### 1. Stop Everything

- Close all terminal windows
- Close browser tabs

### 2. Clean Start

```bash
# Terminal 1 - Backend
cd backend
npm start

# Wait for "Backend running on port 8080"

# Terminal 2 - Agent
cd agent
node agent.js

# Wait for "Agent connected to backend"

# Terminal 3 - Dashboard
cd dashboard
npm run dev

# Wait for "Ready on http://localhost:3000"
```

### 3. Open Browser

```
http://localhost:3000/dashboard
```

### 4. Check Console (F12)

Should see:

```
✅ Dashboard connected to backend successfully!
```

---

## Still Not Working?

### Check Backend Logs

Look in backend terminal for:

- Connection attempts
- Error messages
- WebSocket upgrade requests

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Look for connection attempts
5. Check status codes

### Test Backend Directly

```bash
curl http://localhost:8080
```

Should respond (even if with an error, it means backend is reachable)

---

## Success Indicators

✅ **Backend Terminal:**

```
Backend running on port 8080
```

✅ **Dashboard Terminal:**

```
Ready on http://localhost:3000
```

✅ **Browser Console:**

```
🔌 WebSocket Connection Info:
Using Backend URL: ws://localhost:8080
✅ Dashboard connected to backend successfully!
[SYSTEM] Connected to backend
```

✅ **Dashboard UI:**

- No red error messages
- Device list loads
- Can select and authenticate devices

---

## Quick Commands Reference

**Start backend:**

```bash
cd backend && npm start
```

**Start dashboard:**

```bash
cd dashboard && npm run dev
```

**Check .env.local:**

```bash
type dashboard\.env.local
```

**Create .env.local:**

```bash
echo NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080 > dashboard\.env.local
```

**Check ports:**

```bash
netstat -an | findstr ":8080"
netstat -an | findstr ":3000"
```

**Diagnose:**

```bash
diagnose-connection.bat
```

**Fix automatically:**

```bash
fix-connection.bat
```

---

## Need More Help?

1. Run `diagnose-connection.bat` and share the output
2. Check backend terminal for error messages
3. Check browser console (F12) for detailed errors
4. Verify all files are in correct locations
5. Make sure you're in the correct directory when running commands
