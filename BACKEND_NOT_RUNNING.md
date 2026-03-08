# Backend Not Running - Fix Guide

## The Error You're Seeing

```
❌ WebSocket Connection Error!
Trying to connect to: ws://localhost:8080
```

This means the dashboard is trying to connect to the backend, but the backend
isn't running or isn't accepting connections.

---

## Quick Fix

### Step 1: Check if Backend is Running

```bash
check-backend-now.bat
```

### Step 2: Start Backend if Not Running

```bash
start-backend-only.bat
```

### Step 3: Verify Backend Started

Look for this in the backend terminal:

```
Backend running on port 8080
```

### Step 4: Refresh Dashboard

Press F5 in your browser

---

## Manual Steps

### 1. Open a Terminal

```bash
cd backend
```

### 2. Install Dependencies (if needed)

```bash
npm install
```

### 3. Start Backend

```bash
npm start
```

### 4. Verify It's Running

You should see:

```
Backend running on port 8080
```

### 5. Check Port is Open

In another terminal:

```bash
netstat -an | findstr ":8080"
```

Should show something like:

```
TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING
```

---

## Common Issues

### Issue 1: "Cannot find module 'ws'"

**Cause:** Dependencies not installed

**Fix:**

```bash
cd backend
npm install
npm start
```

### Issue 2: "Port 8080 is already in use"

**Cause:** Another process is using port 8080

**Fix:**

```bash
# Find what's using port 8080
netstat -ano | findstr ":8080"

# Kill the process (replace PID with actual number)
taskkill /F /PID <PID>

# Start backend again
cd backend
npm start
```

### Issue 3: Backend starts but immediately closes

**Cause:** Error in backend code or missing dependencies

**Fix:**

1. Check the terminal for error messages
2. Make sure all dependencies are installed:
   ```bash
   cd backend
   npm install
   ```
3. Check if `server.js` exists
4. Try running with more verbose output:
   ```bash
   node server.js
   ```

### Issue 4: "npm: command not found"

**Cause:** Node.js/npm not installed

**Fix:**

1. Install Node.js from https://nodejs.org/
2. Restart terminal
3. Verify: `node --version` and `npm --version`

---

## Verification Checklist

- [ ] Node.js is installed (`node --version` works)
- [ ] npm is installed (`npm --version` works)
- [ ] Backend folder exists
- [ ] `backend/server.js` exists
- [ ] `backend/package.json` exists
- [ ] `backend/node_modules` folder exists (run `npm install` if not)
- [ ] Backend terminal shows "Backend running on port 8080"
- [ ] Port 8080 is open (`netstat -an | findstr ":8080"` shows LISTENING)
- [ ] No firewall blocking port 8080

---

## Step-by-Step Troubleshooting

### 1. Verify Node.js Installation

```bash
node --version
npm --version
```

Both should show version numbers. If not, install Node.js.

### 2. Navigate to Backend Folder

```bash
cd backend
dir
```

Should show:

- server.js
- package.json
- node_modules (folder)

### 3. Install Dependencies

```bash
npm install
```

Wait for it to complete. Should show:

```
added X packages
```

### 4. Start Backend

```bash
npm start
```

Should show:

```
Backend running on port 8080
```

### 5. Test Connection

In another terminal:

```bash
netstat -an | findstr ":8080"
```

Should show:

```
TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING
```

### 6. Refresh Dashboard

Go to browser and press F5

Browser console should show:

```
✅ Dashboard connected to backend successfully!
```

---

## Still Not Working?

### Check Backend Terminal for Errors

Look for error messages like:

- "Cannot find module" → Run `npm install`
- "Port already in use" → Kill process on port 8080
- "Permission denied" → Run as administrator
- Syntax errors → Check if server.js is corrupted

### Check Firewall

Windows Firewall might be blocking port 8080:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js and make sure it's allowed
4. Or temporarily disable firewall for testing

### Check Antivirus

Some antivirus software blocks WebSocket connections:

1. Temporarily disable antivirus
2. Test if backend connects
3. If it works, add exception for Node.js

---

## Complete Fresh Start

If nothing works, try a complete fresh start:

### 1. Stop Everything

Close all terminal windows

### 2. Clean Install Backend

```bash
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### 3. Start Backend

```bash
npm start
```

### 4. Verify

```bash
netstat -an | findstr ":8080"
```

### 5. Start Dashboard

```bash
cd dashboard
npm run dev
```

### 6. Open Browser

```
http://localhost:3000/dashboard
```

---

## Success Indicators

✅ **Backend Terminal:**

```
Backend running on port 8080
```

✅ **Port Check:**

```
TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING
```

✅ **Dashboard Console:**

```
✅ Dashboard connected to backend successfully!
```

✅ **No Errors:**

- No "WebSocket Connection Error"
- No "Cannot connect to backend"
- No "Port already in use"

---

## Quick Commands Reference

**Check if backend is running:**

```bash
netstat -an | findstr ":8080"
```

**Start backend:**

```bash
cd backend
npm start
```

**Install dependencies:**

```bash
cd backend
npm install
```

**Kill process on port 8080:**

```bash
netstat -ano | findstr ":8080"
taskkill /F /PID <PID>
```

**Check Node.js version:**

```bash
node --version
npm --version
```

---

## Need More Help?

1. Run `check-backend-now.bat` and share the output
2. Check backend terminal for error messages
3. Verify Node.js is installed
4. Make sure you're in the correct directory
5. Try running `start-backend-only.bat`
