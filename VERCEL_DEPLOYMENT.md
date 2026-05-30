# Vercel Deployment Guide for Vortix Dashboard

## 🚀 Quick Fix for "No Next.js version detected" Error

### Problem

Vercel can't find Next.js because the root directory is not set correctly.

### Solution (Choose One)

---

## ✅ Method 1: Update Vercel Settings (Easiest)

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Click on your project

2. **Update Root Directory:**
   - Go to **Settings** → **General**
   - Scroll to **Root Directory**
   - Click **Edit**
   - Enter: `dashboard`
   - Click **Save**

3. **Update Build Settings:**
   - In **Settings** → **General**
   - Find **Build & Development Settings**
   - Set:
     - **Framework Preset:** Next.js
     - **Build Command:** `npm run build` (or leave default)
     - **Output Directory:** `.next` (or leave default)
     - **Install Command:** `npm install` (or leave default)

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click the three dots (...) on the latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete

---

## ✅ Method 2: Deploy from Dashboard Folder

### Option A: Connect Dashboard Folder Directly

1. **In Vercel Dashboard:**
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - When configuring:
     - **Root Directory:** `dashboard`
     - **Framework Preset:** Next.js
     - Click **Deploy**

### Option B: Use Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to dashboard folder
cd dashboard

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy!
```

---

## ✅ Method 3: Use vercel.json Configuration

I've already created two `vercel.json` files for you:

### Root vercel.json

Located at: `vercel.json`

```json
{
	"buildCommand": "cd dashboard && npm install && npm run build",
	"outputDirectory": "dashboard/.next",
	"installCommand": "cd dashboard && npm install",
	"framework": "nextjs"
}
```

### Dashboard vercel.json

Located at: `dashboard/vercel.json`

```json
{
	"framework": "nextjs",
	"buildCommand": "npm run build",
	"installCommand": "npm install",
	"devCommand": "npm run dev",
	"outputDirectory": ".next"
}
```

**To use this method:**

1. Commit and push the vercel.json files
2. Redeploy on Vercel
3. It should work automatically

---

## 🔧 Environment Variables

Don't forget to set these in Vercel:

1. **Go to Settings → Environment Variables**

2. **Add these variables:**

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
CLERK_SECRET_KEY=sk_live_your_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend WebSocket URL
NEXT_PUBLIC_BACKEND_WS=wss://your-backend-url.com
```

3. **Important:** Use **production keys** (pk*live*, sk*live*) not test keys!

---

## 📋 Complete Deployment Checklist

### Before Deployment

- [ ] Dashboard works locally (`npm run dev`)
- [ ] All environment variables ready
- [ ] Clerk production keys obtained
- [ ] Backend deployed and URL known
- [ ] Code committed to GitHub

### Vercel Configuration

- [ ] Root directory set to `dashboard`
- [ ] Framework preset set to Next.js
- [ ] Environment variables added
- [ ] Production keys used (not test keys)

### After Deployment

- [ ] Visit deployed URL
- [ ] Test authentication (/auth)
- [ ] Test dashboard access
- [ ] Test device connection
- [ ] Check browser console for errors

---

## 🐛 Troubleshooting

### Error: "No Next.js version detected"

**Cause:** Root directory not set correctly

**Fix:**

1. Set Root Directory to `dashboard` in Vercel settings
2. Or use vercel.json configuration
3. Redeploy

---

### Error: "Module not found: Can't resolve '@clerk/nextjs'"

**Cause:** Dependencies not installed

**Fix:**

1. Make sure `package.json` is in dashboard folder
2. Check Install Command is `npm install`
3. Redeploy

---

### Error: "CLERK_SECRET_KEY is not defined"

**Cause:** Environment variables not set

**Fix:**

1. Go to Settings → Environment Variables
2. Add all required variables
3. Make sure to use production keys
4. Redeploy

---

### Error: "Failed to connect to backend"

**Cause:** Backend URL incorrect or backend not running

**Fix:**

1. Check NEXT_PUBLIC_BACKEND_WS is correct
2. Make sure it starts with `wss://` (not `https://`)
3. Verify backend is deployed and running
4. Test backend health: `https://your-backend.com/health`

---

### Build succeeds but page shows errors

**Cause:** Runtime environment variables missing

**Fix:**

1. Check browser console for specific errors
2. Verify all NEXT*PUBLIC* variables are set
3. Make sure Clerk keys are production keys
4. Redeploy after fixing

---

## 🎯 Recommended Setup

### For Production:

1. **Use Method 1** (Update Vercel Settings)
   - Cleanest approach
   - Easy to manage
   - No config files needed

2. **Set Root Directory:** `dashboard`

3. **Use Production Keys:**
   - Clerk: `pk_live_...` and `sk_live_...`
   - Not test keys!

4. **Backend URL:**
   - Use your production backend URL
   - Format: `wss://your-backend.com`

---

## 📊 Deployment Flow

```
1. Push code to GitHub
   ↓
2. Vercel detects changes
   ↓
3. Vercel builds from dashboard folder
   ↓
4. Vercel installs dependencies
   ↓
5. Vercel runs build command
   ↓
6. Vercel deploys to CDN
   ↓
7. Your site is live! 🎉
```

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Clerk Docs:** https://clerk.com/docs

---

## 💡 Pro Tips

1. **Use Preview Deployments:**
   - Every push to a branch creates a preview
   - Test before merging to main

2. **Check Build Logs:**
   - Click on deployment
   - View build logs for errors
   - Very helpful for debugging

3. **Use Environment Variables:**
   - Never commit secrets to Git
   - Use Vercel's environment variables
   - Different values for preview/production

4. **Monitor Performance:**
   - Vercel Analytics shows performance
   - Check Core Web Vitals
   - Optimize if needed

---

## ✅ Success Indicators

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Deployment shows "Ready"
- ✅ Can visit the URL
- ✅ Authentication works
- ✅ Dashboard loads
- ✅ Can connect to backend
- ✅ No console errors

---

## 🎉 You're Done!

Once deployed successfully:

1. **Test Everything:**
   - Sign up/sign in
   - Connect devices
   - Execute commands
   - Check history

2. **Share Your URL:**
   - Your dashboard is now live!
   - Share with team/users
   - Update documentation

3. **Monitor:**
   - Check Vercel Analytics
   - Monitor error logs
   - Watch performance

---

## 📞 Need Help?

- **Vercel Support:** https://vercel.com/support
- **Clerk Support:** https://clerk.com/support
- **GitHub Issues:** https://github.com/Vaibhav262610/vortix/issues
- **Email:** vaibhavrajpoot2626@gmail.com

---

**Last Updated:** May 30, 2026  
**Status:** Production Ready  
**Deployment Time:** ~5 minutes

---

**Happy Deploying! 🚀**
