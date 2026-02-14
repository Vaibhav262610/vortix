# AI Planning Solutions

## The Problem

Your backend is deployed on Render (cloud), but Ollama runs locally on your
machine. The cloud backend can't access your local Ollama instance at
`localhost:11434`.

## ✅ Current Status

Your code already handles this gracefully:

- Backend catches the error
- Sends `PLAN_ERROR` to dashboard
- Dashboard shows alert: "AI planning is not available on this server"

## 🎯 Solutions

### Solution 1: Use Direct Commands (Recommended for Now)

Instead of using "AI Plan" button, just type commands directly:

**Examples:**

```
dir C:\Users
echo Hello World > test.txt
mkdir newfolder
```

The dashboard will execute these commands directly without AI planning.

### Solution 2: Run Backend Locally (For Development)

If you want AI planning to work:

```bash
# Terminal 1: Start Ollama (if not running)
ollama serve

# Terminal 2: Start backend locally
cd backend
node server.js

# Terminal 3: Start agent
vortix start
```

Then update agent to use localhost:

```javascript
const BACKEND_URL = "ws://localhost:8080";
```

### Solution 3: Deploy Ollama to Cloud (Advanced)

Deploy Ollama to a cloud server and update backend:

```javascript
const ollamaUrl = process.env.OLLAMA_URL || "https://your-ollama-server.com";
```

### Solution 4: Switch to OpenAI API (Easiest Cloud Solution)

Replace Ollama with OpenAI API:

1. Get OpenAI API key from https://platform.openai.com
2. Add to Render environment variables:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-...`

3. Update `backend/server.js`:

```javascript
async function generatePlan(userInput, platform) {
	// Use OpenAI instead of Ollama
	const OpenAI = require("openai");
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});

	const prompt = `You are an AI OS command planner...`;

	const response = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [{ role: "user", content: prompt }],
		temperature: 0,
	});

	const text = response.choices[0].message.content;
	return JSON.parse(text);
}
```

4. Add openai dependency:

```bash
cd backend
npm install openai
```

5. Redeploy to Render

---

## 🎮 How to Use Without AI Planning

### Direct Command Mode

1. Select your device
2. Type command directly (don't click "AI Plan")
3. Click "Execute"

**Example Commands:**

Windows:

```
dir
echo Hello > test.txt
mkdir myfolder
type test.txt
```

Linux/Mac:

```
ls -la
echo "Hello" > test.txt
mkdir myfolder
cat test.txt
```

---

## 📊 Feature Comparison

| Feature         | Local Backend | Cloud Backend (Current) | Cloud + OpenAI  |
| --------------- | ------------- | ----------------------- | --------------- |
| Direct Commands | ✅ Works      | ✅ Works                | ✅ Works        |
| AI Planning     | ✅ Works      | ❌ Not available        | ✅ Works        |
| Cost            | Free          | Free                    | ~$0.01 per plan |
| Setup           | Complex       | Simple                  | Medium          |

---

## 🚀 Recommended Approach

**For Now:**

- Use direct commands (no AI planning needed)
- Your app works perfectly for remote command execution

**For Production:**

- Add OpenAI API support (Solution 4)
- Or remove AI planning feature entirely
- Or run backend locally when you need AI planning

---

## ✅ What Works Right Now

Your system is fully functional:

- ✅ Backend on Render
- ✅ Dashboard on Vercel
- ✅ Agent connects successfully
- ✅ Direct command execution works
- ✅ Real-time logs
- ✅ Multi-device support

Only AI planning doesn't work (because Ollama is local).

---

## 💡 Quick Test

1. Open dashboard: https://vortixredeploy.vercel.app
2. Select your device
3. Type: `echo Hello from Vortix`
4. Click "Execute" (not "AI Plan")
5. See output in logs ✅

**Your app is working!** Just skip the AI planning feature for now.

---

**Recommendation: Use direct commands for now, add OpenAI later if needed.** 🎯
