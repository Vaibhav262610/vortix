# How to Get OpenAI API Key

## Step-by-Step Guide

### Step 1: Create OpenAI Account

1. Go to: https://platform.openai.com/signup
2. Sign up with:
   - Email address, or
   - Google account, or
   - Microsoft account

### Step 2: Verify Email

Check your email and click the verification link.

### Step 3: Add Payment Method

1. Go to: https://platform.openai.com/account/billing/overview
2. Click "Add payment method"
3. Enter credit/debit card details
4. Add at least $5 credit (minimum)

**Note**: OpenAI requires a payment method, but charges are very low:

- GPT-4o-mini: ~$0.15 per 1M tokens
- For your use case: ~$0.01-0.02 per AI plan

### Step 4: Create API Key

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a name: "Vortix Backend"
4. Click "Create secret key"
5. **COPY THE KEY IMMEDIATELY** (you won't see it again!)

The key looks like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 5: Save the Key Securely

⚠️ **IMPORTANT**:

- Never share your API key
- Never commit it to GitHub
- Store it in environment variables only

---

## 💰 Pricing

OpenAI charges per token (words):

| Model       | Input           | Output          | Your Cost       |
| ----------- | --------------- | --------------- | --------------- |
| GPT-4o-mini | $0.15/1M tokens | $0.60/1M tokens | ~$0.01 per plan |
| GPT-4o      | $2.50/1M tokens | $10/1M tokens   | ~$0.10 per plan |

**Recommendation**: Use `gpt-4o-mini` (cheaper and fast enough)

**Monthly estimate**:

- 100 AI plans/month = ~$1
- 1000 AI plans/month = ~$10

---

## 🔧 Add to Your Backend

### Option 1: Add to Render Environment Variables

1. Go to: https://dashboard.render.com
2. Select your `vortix` service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-xxxxxxxxxxxxx` (your key)
6. Click "Save Changes"
7. Render will automatically redeploy

### Option 2: Add Locally (for testing)

Create `backend/.env`:

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

Then update `backend/server.js` to load it:

```javascript
require("dotenv").config();
```

---

## 📝 Update Backend Code

I'll create the updated code for you in the next step.

---

## 🆓 Free Alternatives

If you don't want to pay for OpenAI:

### 1. Keep Using Ollama Locally

- Run backend locally: `node server.js`
- Free and unlimited
- Only works on your machine

### 2. Use Groq (Free Tier)

- Similar to OpenAI but free
- Get key from: https://console.groq.com
- 30 requests/minute free

### 3. Use Anthropic Claude

- Get key from: https://console.anthropic.com
- Similar pricing to OpenAI

### 4. Skip AI Planning

- Just use direct commands
- Your app works perfectly without it

---

## ✅ Quick Summary

1. **Sign up**: https://platform.openai.com/signup
2. **Add payment**: https://platform.openai.com/account/billing
3. **Create key**: https://platform.openai.com/api-keys
4. **Copy key**: `sk-proj-xxxxx...`
5. **Add to Render**: Environment variables
6. **Update code**: (I'll help with this)

---

## 🔗 Useful Links

- OpenAI Platform: https://platform.openai.com
- API Keys: https://platform.openai.com/api-keys
- Billing: https://platform.openai.com/account/billing
- Pricing: https://openai.com/api/pricing
- Documentation: https://platform.openai.com/docs

---

**After you get the key, let me know and I'll update your backend code!** 🚀
