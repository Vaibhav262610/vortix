# Setup Groq API (5 Minutes)

Your backend is now ready to use Groq! Just add the API key.

## ✅ Step 1: Get Groq API Key

1. Go to: **https://console.groq.com/keys**
2. Sign up with Google (fastest)
3. Click "Create API Key"
4. Name it: "Vortix"
5. Copy the key (starts with `gsk_...`)

## ✅ Step 2: Add to Render

1. Go to: **https://dashboard.render.com**
2. Click on your `vortix` service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Enter:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_xxxxxxxxxxxxx` (paste your key)
6. Click "Save Changes"

Render will automatically redeploy (takes ~2 minutes).

## ✅ Step 3: Test AI Planning

1. Open dashboard: **https://vortixredeploy.vercel.app**
2. Select your device
3. Type: "create a test file on desktop"
4. Click **"AI Plan"**
5. Should work! ✅

## 🎯 What Changed

Your backend now:

- ✅ Checks for `GROQ_API_KEY` first
- ✅ Uses Groq if key exists (cloud)
- ✅ Falls back to Ollama if no key (local)
- ✅ Shows clear error messages

## 📊 Groq Free Tier

- **30 requests/minute** - More than enough!
- **Unlimited daily usage**
- **No credit card required**
- **Forever free**

## 🔗 Quick Links

- Get API Key: https://console.groq.com/keys
- Render Dashboard: https://dashboard.render.com
- Your Dashboard: https://vortixredeploy.vercel.app

---

**Get your Groq key now and add it to Render!** 🚀

It takes 2 minutes and AI planning will work perfectly.
