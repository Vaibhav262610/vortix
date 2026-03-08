# 🚀 Vortix - Quick Start Guide

## One-Command Start

```bash
start-all-with-logs.bat
```

This will:

1. ✅ Start backend (port 8080)
2. ✅ Start agent (connects to backend)
3. ✅ Start dashboard (port 3000)
4. ✅ Open browser to dashboard

---

## What You'll See

### 1. Three Terminal Windows

**Backend Terminal:**

```
Backend server running on port 8080
```

**Agent Terminal:**

```
Agent connected to backend
Device name: YOUR-COMPUTER-NAME
```

**Dashboard Terminal:**

```
Ready on http://localhost:3000
```

### 2. Browser Opens Automatically

URL: http://localhost:3000/dashboard

---

## First Time Setup

### Step 1: Authenticate Device

1. You'll see your device in the device list
2. Click on the device
3. Enter password: `vortix123` (default)
4. Device will show green checkmark ✓

### Step 2: Check System Stats

Look at the **RIGHT SIDEBAR** (fixed on right edge):

- 📊 System Stats widget
- CPU, Memory, Disk usage bars
- Updates every 3 seconds

### Step 3: Try a Command

1. Type in command box: `dir` (Windows) or `ls` (Mac/Linux)
2. Press Ctrl+Enter or click Execute
3. See output in logs section

---

## Features to Test

### 🎨 Theme Toggle

- Click 🌙/☀️ button in header
- Switches between dark/light mode
- Theme persists on reload

### 📊 System Stats (Right Sidebar)

- Real-time CPU usage
- Real-time Memory usage
- Updates every 3 seconds

### 💻 Device Management

- See online/offline devices
- Authenticate devices
- Switch between devices

### ⚡ Quick Commands

- Click "Quick Commands" button
- Pre-built commands for common tasks
- One-click execution

### 📁 File Transfer

- Click blue folder icon (bottom left)
- Browse files on remote device
- Upload/download files

### 🔄 Multi-Device Execution

- Click purple devices icon (bottom left)
- Select multiple devices
- Execute command on all at once

### 🚀 Auto-Start on Boot

- Toggle switch in device panel
- Agent starts automatically on boot
- Requires admin privileges on Windows

---

## Keyboard Shortcuts

- `Ctrl+Enter` - Execute command
- `Ctrl+K` - Open quick commands
- `ESC` - Close modals
- `F12` - Open browser console (for debugging)

---

## Troubleshooting

### ❌ Dashboard won't load

```bash
check-services.bat
```

Make sure backend and dashboard are running.

### ❌ Device not connecting

1. Check agent terminal for errors
2. Make sure backend is running
3. Restart agent: `cd agent && node agent.js`

### ❌ System stats not showing

1. Select a device (click on it)
2. Check right sidebar (scroll right if needed)
3. Open browser console (F12) for errors

### ❌ Commands not executing

1. Make sure device is authenticated (green checkmark)
2. Check device is online (green dot)
3. Check agent terminal for errors

---

## Manual Start (Alternative)

If you prefer to start services manually:

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - Agent:**

```bash
cd agent
node agent.js
```

**Terminal 3 - Dashboard:**

```bash
cd dashboard
npm run dev
```

**Browser:**

```
http://localhost:3000/dashboard
```

---

## Test Scripts

- `start-all-with-logs.bat` - Start everything with logs
- `check-services.bat` - Check if services are running
- `test-system-stats.bat` - Test system stats feature
- `test-dashboard-only.bat` - Test dashboard without backend

---

## Documentation

- `SYSTEM_STATS_VERIFICATION.md` - Complete system stats testing guide
- `QUICK_TEST.md` - Quick reference for testing
- `FIXED_ISSUES.md` - Recent fixes and solutions
- `TEST_SYSTEM_STATS.md` - Detailed test procedures

---

## Need Help?

1. Check terminal windows for error messages
2. Open browser console (F12) for JavaScript errors
3. Run `check-services.bat` to verify services
4. Restart all services: Close terminals and run `start-all-with-logs.bat`

---

## Success Checklist

✅ Backend running on port 8080 ✅ Agent connected to backend ✅ Dashboard
running on port 3000 ✅ Device authenticated in dashboard ✅ System stats
updating every 3 seconds ✅ Commands executing successfully ✅ Theme toggle
working ✅ No errors in any console

---

## 🎉 You're Ready!

Everything is set up and working. Enjoy using Vortix!

**Next Steps:**

- Try executing different commands
- Test file transfer feature
- Monitor system stats in real-time
- Try multi-device execution
- Customize quick commands
