# Fix WebSocket Connection - DO THIS NOW

## The Problem

Your dashboard shows: `❌ WebSocket error: {}`

This means the dashboard is trying to connect to the wrong URL or the backend
isn't running.

---

## The Solution (Choose One)

### Option 1: Automatic Fix (RECOMMENDED)

```bash
auto-fix-and-start.bat
```

This will:

- ✅ Fix environment variables automatically
- ✅ Stop any conflicting services
- ✅ Start backend, agent, and dashboard
- ✅ Open browser automatically

**Just run it and wait!**

---

### Option 2: Manual Fix (If automatic doesn't work)

**Step 1:** Create/fix environment file

```bash
cd dashboard
echo NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080 > .env.local
```

**Step 2:** Restart dashboard

```bash
# Stop current dashboard (Ctrl+C)
npm run dev
```

**Step 3:** Refresh browser (F5)

---

## How to Verify It's Fixed

### In Browser Console (F12):

**BEFORE (Error):**

```
❌ WebSocket error: {}
Backend URL: wss://vortix.onrender.com
```

**AFTER (Fixed):**

```
🔌 WebSocket Connection Info:
Using Backend URL: ws://localhost:8080
✅ Dashboard connected to backend successfully!
```

---

## Still Not Working?

### Quick Checks:

1. **Is backend running?**

   ```bash
   netstat -an | findstr ":8080"
   ```

   Should show something. If not, start backend:

   ```bash
   cd backend
   npm start
   ```

2. **Did you restart dashboard?**
   - You MUST restart after changing .env.local
   - Stop with Ctrl+C
   - Start with `npm run dev`

3. **Is .env.local correct?**
   ```bash
   type dashboard\.env.local
   ```
   Should show: `NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080`

---

## The Root Cause

The dashboard was configured to connect to the production server
(`wss://vortix.onrender.com`) instead of your local backend
(`ws://localhost:8080`).

The `.env.local` file tells the dashboard to use localhost, but:

- The file might not exist
- The dashboard might not have been restarted after creating it
- The backend might not be running

---

## Quick Commands

**Fix everything automatically:**

```bash
auto-fix-and-start.bat
```

**Diagnose the problem:**

```bash
diagnose-connection.bat
```

**Manual fix:**

```bash
fix-connection.bat
```

**Check what's running:**

```bash
netstat -an | findstr ":8080"
netstat -an | findstr ":3000"
```

---

## Success = This in Browser Console:

```
==================================================
🔌 WebSocket Connection Info:
Environment Variable: ws://localhost:8080
Using Backend URL: ws://localhost:8080
==================================================
🔄 Attempting to connect to: ws://localhost:8080?type=dashboard
✅ Dashboard connected to backend successfully!
Connected to: ws://localhost:8080
[SYSTEM] Connected to backend
```

---

## Need Help?

Read the complete guide: `WEBSOCKET_CONNECTION_FIX.md`

Or just run: `auto-fix-and-start.bat`
