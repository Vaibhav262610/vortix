# Debug AI Planning Issue

## 🔍 The Problem

"EXECUTION_FINISHED" appears immediately without showing the plan preview.

## ✅ Checklist

### 1. Verify Render Has Latest Code

Go to: https://dashboard.render.com

- Select your `vortix` service
- Check "Events" tab
- Should see recent deployment after you pushed code
- If not, click "Manual Deploy" → "Deploy latest commit"

### 2. Verify Environment Variable

In Render dashboard:

- Go to "Environment" tab
- Check if `GROQ_API_KEY` exists
- Value should start with `gsk_`
- If missing, add it now

### 3. Check Render Logs

In Render dashboard:

- Click "Logs" tab
- Try AI planning from dashboard
- Look for these messages:

**✅ Good (Groq working)**:

```
Using Groq API for AI planning
Groq AI output: {"steps":[...]}
Generated plan: [...]
AI Plan sent for approval
```

**❌ Bad (Still using Ollama)**:

```
Using Ollama for AI planning (local only)
Ollama connection error: ...
```

### 4. Test in Dashboard

1. Open: https://vortixredeploy.vercel.app
2. Open browser console (F12)
3. Select your device
4. Type: **"create a test file on desktop"**
5. Click "AI Plan"
6. Watch console for:
   - `Message received: PLAN_PREVIEW`
   - `Plan preview received: [...]`

### 5. Check for Errors

In browser console, look for:

- Red error messages
- `PLAN_ERROR` messages
- Network errors

## 🐛 Common Issues

### Issue 1: Render Didn't Redeploy

**Solution**: Manual deploy

1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
4. Wait 2-3 minutes

### Issue 2: Environment Variable Not Set

**Solution**: Add it now

1. Render dashboard → Environment tab
2. Add `GROQ_API_KEY` =
   `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`
3. Save (auto-redeploys)

### Issue 3: Dashboard Cache

**Solution**: Hard refresh

1. Press Ctrl + Shift + Delete
2. Clear cache
3. Hard refresh: Ctrl + F5

### Issue 4: Groq API Error

**Solution**: Check API key

1. Go to: https://console.groq.com/keys
2. Verify key is active
3. Try creating a new key if needed

## 🧪 Manual Test

Test Groq API directly:

```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

Should return JSON with a response.

## 📝 Expected Behavior

### Correct Flow:

1. User clicks "AI Plan"
2. Dashboard shows "Planning..." spinner
3. Backend calls Groq API
4. Backend sends PLAN_PREVIEW to dashboard
5. **Dashboard shows modal with plan steps** ← Should see this!
6. User clicks "Approve"
7. Commands execute
8. Shows "EXECUTION_FINISHED"

### Current (Wrong) Flow:

1. User clicks "AI Plan"
2. Immediately shows "EXECUTION_FINISHED"
3. No plan preview modal

## 🔧 Quick Fix Steps

1. **Verify Render redeployed**:
   - Check Events tab in Render
   - Should show deployment after your git push

2. **Add environment variable** (if not there):
   - Environment tab → Add `GROQ_API_KEY`

3. **Check logs** while testing:
   - Logs tab → Watch in real-time
   - Try AI planning
   - See what backend outputs

4. **Test with simple command**:
   - "list files"
   - Should be quick and simple

## 🎯 Next Steps

1. Go to Render dashboard
2. Check if latest code is deployed
3. Verify `GROQ_API_KEY` is set
4. Check logs while testing
5. Report what you see in logs

---

**Most likely issue**: Render hasn't redeployed with new code yet. Check Events
tab!
