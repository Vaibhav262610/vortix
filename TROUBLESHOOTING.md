# 🔧 Troubleshooting Guide

## WebSocket Connection Error

### Problem

```
WebSocket error: {}
Dashboard WebSocket disconnected
```

### Solution

#### Step 1: Check if Backend is Running

Open a terminal and run:

```bash
cd backend
npm start
```

You should see:

```
Backend running on port 8080
```

If you see an error, install dependencies:

```bash
npm install
```

#### Step 2: Check Backend URL

In `dashboard/.env.local`, verify:

```
NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080
```

#### Step 3: Restart Dashboard

```bash
cd dashboard
npm run dev
```

#### Step 4: Check Browser Console

Open DevTools (F12) and look for:

- ✅ "Dashboard connected to backend" - Good!
- ❌ "WebSocket error" - Backend not running

---

## Can't See Changes

### Problem

Made changes but don't see them in browser

### Solution

#### Option 1: Hard Refresh

- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

#### Option 2: Clear Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

#### Option 3: Restart Dev Server

```bash
# Stop dashboard (Ctrl+C)
cd dashboard
npm run dev
```

#### Option 4: Delete .next folder

```bash
cd dashboard
rm -rf .next
npm run dev
```

---

## Quick Start (All Services)

### Windows

Double-click `start-all.bat`

### Manual Start

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - Agent:**

```bash
cd agent
node agent.js start
```

**Terminal 3 - Dashboard:**

```bash
cd dashboard
npm run dev
```

---

## Common Errors

### Error: "Cannot find module"

**Solution:**

```bash
cd dashboard
npm install
```

### Error: "Port 3000 already in use"

**Solution:**

```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### Error: "ECONNREFUSED"

**Solution:** Backend is not running. Start it:

```bash
cd backend
npm start
```

### Error: "Module not found: Can't resolve '../contexts/ThemeContext'"

**Solution:** The new files weren't created. Check if these exist:

- `dashboard/contexts/ThemeContext.tsx`
- `dashboard/components/Widget.tsx`

If missing, the implementation didn't complete. Let me know!

---

## Verify Installation

### Check Backend

```bash
cd backend
node -e "console.log('Backend OK')"
```

### Check Agent

```bash
cd agent
node -e "console.log('Agent OK')"
```

### Check Dashboard

```bash
cd dashboard
npm run build
```

Should complete without errors.

---

## Check New Features

### 1. Theme Context Exists?

```bash
ls dashboard/contexts/ThemeContext.tsx
```

Should show the file. If not found, the new features weren't created.

### 2. Components Exist?

```bash
ls dashboard/components/
```

Should show:

- Widget.tsx
- SystemStatsWidget.tsx
- RecentCommandsWidget.tsx
- DeviceStatusWidget.tsx
- FileTransfer.tsx
- MultiDeviceSelector.tsx

### 3. Backend Updated?

```bash
cd backend
grep "MULTI_DEVICE_EXECUTE" server.js
```

Should find the text. If not, backend wasn't updated.

---

## Still Having Issues?

### Get Detailed Logs

**Backend:**

```bash
cd backend
DEBUG=* npm start
```

**Dashboard:** Check browser console (F12) for errors

**Agent:**

```bash
cd agent
node agent.js start
```

Watch for connection messages

---

## Reset Everything

If nothing works, reset:

```bash
# Stop all services (Ctrl+C in each terminal)

# Clean install
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../agent
rm -rf node_modules package-lock.json
npm install

cd ../dashboard
rm -rf node_modules package-lock.json .next
npm install

# Start fresh
cd ../backend && npm start
# New terminal
cd agent && node agent.js start
# New terminal
cd dashboard && npm run dev
```

---

## Contact

If you're still stuck:

1. Check which step failed
2. Copy the exact error message
3. Note which terminal/file it's from
4. Let me know and I'll help!

---

## Quick Checklist

- [ ] Backend running on port 8080
- [ ] Agent connected to backend
- [ ] Dashboard running on port 3000
- [ ] Browser shows dashboard
- [ ] No errors in console
- [ ] Can see devices list

If all checked, you're good to go! ✅
