# Fix Dashboard Environment Variable

The dashboard needs the backend URL configured in Vercel.

## 🔧 Add Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard

Visit:
https://vercel.com/vaibhav262610s-projects/vortix/settings/environment-variables

### Step 2: Add Environment Variable

Click "Add New" and enter:

- **Key**: `NEXT_PUBLIC_BACKEND_WS`
- **Value**: `wss://vortix.onrender.com`
- **Environments**: Check all (Production, Preview, Development)

### Step 3: Redeploy

After adding the variable, redeploy:

```bash
cd dashboard
vercel --prod
```

Or click "Redeploy" in Vercel dashboard.

---

## ✅ Verify

After redeployment:

1. Open: https://vortix-ruddy.vercel.app
2. Open browser console (F12)
3. Look for: `Backend URL: wss://vortix.onrender.com`
4. Should see: `Dashboard connected to backend`

---

## 🔍 Troubleshooting

### If still showing localhost:

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard refresh**: Ctrl+F5
3. **Open in incognito/private window**

### Check environment variable:

In Vercel dashboard, verify:

- Variable name: `NEXT_PUBLIC_BACKEND_WS`
- Variable value: `wss://vortix.onrender.com`
- Applied to: Production ✓

---

## 📝 Quick Fix (Alternative)

If you want to skip environment variables, the code now has a hardcoded
fallback:

```typescript
const backendWS =
	process.env.NEXT_PUBLIC_BACKEND_WS || "wss://vortix.onrender.com";
```

So it should work even without the env var, but it's better to use the env var
for flexibility.

---

**After fixing, your dashboard will connect to Render backend!** ✅
