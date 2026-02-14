# Dashboard Quick Fix

## The Issue

Your browser is loading an old cached version that tries to connect to
`ws://localhost:8080`.

## ✅ Quick Solutions

### Solution 1: Clear Browser Cache (Fastest)

1. Open https://vortix-ruddy.vercel.app
2. Press **Ctrl + Shift + Delete** (Windows) or **Cmd + Shift + Delete** (Mac)
3. Select "Cached images and files"
4. Click "Clear data"
5. **Hard refresh**: Press **Ctrl + F5** (Windows) or **Cmd + Shift + R** (Mac)

### Solution 2: Incognito/Private Window

1. Open a new **Incognito/Private window**
2. Go to: https://vortix-ruddy.vercel.app
3. Should connect to Render backend

### Solution 3: Add Environment Variable in Vercel

1. Go to:
   https://vercel.com/vaibhav262610s-projects/vortix/settings/environment-variables
2. Click "Add New"
3. Enter:
   - **Key**: `NEXT_PUBLIC_BACKEND_WS`
   - **Value**: `wss://vortix.onrender.com`
   - **Environments**: Check all boxes
4. Click "Save"
5. Redeploy: `vercel --prod`

---

## 🧪 Test if Fixed

Open browser console (F12) and look for:

✅ **Working**:

```
Connecting to backend WebSocket...
Backend URL: wss://vortix.onrender.com
Dashboard connected to backend
```

❌ **Still broken**:

```
WebSocket connection to 'ws://localhost:8080/?type=dashboard' failed
```

---

## 🎯 Expected Behavior

After the fix:

1. Dashboard loads
2. Connects to `wss://vortix.onrender.com`
3. Shows list of connected devices
4. Can send commands to devices

---

## 💡 Why This Happened

The dashboard was previously deployed with a hardcoded localhost URL. Even
though we updated the code, your browser cached the old JavaScript files.

The new deployment has:

- Environment variable support
- Fallback to Render URL
- Better logging

---

**Try Solution 1 first (clear cache + hard refresh) - it's the fastest!** 🚀
