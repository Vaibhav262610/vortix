# Use Groq API (Free!)

Groq offers a free tier that's perfect for your project!

## 🎉 Why Groq?

- ✅ **Completely FREE**
- ✅ Fast inference (faster than OpenAI)
- ✅ 30 requests/minute free tier
- ✅ No credit card required
- ✅ Easy to use

---

## 📝 Get Groq API Key (2 minutes)

### Step 1: Sign Up

Go to: https://console.groq.com/keys

Sign up with:

- Google account (easiest)
- Or email

### Step 2: Create API Key

1. After login, you'll see "API Keys" page
2. Click "Create API Key"
3. Give it a name: "Vortix"
4. Click "Submit"
5. **COPY THE KEY** (starts with `gsk_...`)

Example: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Done!

That's it! No credit card needed.

---

## 🔧 Update Your Backend

I'll update the code to use Groq instead of Ollama.

### Update backend/server.js

Replace the `generatePlan` function:

```javascript
async function generatePlan(userInput, platform) {
	const homeDir = os.homedir();
	const desktopPath = path.join(homeDir, "Desktop");

	const prompt = `
You are an AI OS command planner. Generate EXACT Windows commands for the user's request.

System Information:
- Home Directory: ${homeDir}
- Desktop Path: ${desktopPath}
- Platform: ${platform}

CRITICAL RULES:
1. Return ONLY valid JSON in this format - nothing else
2. Use ABSOLUTE paths, NOT relative paths
3. Use echo command for file creation (NOT type, NOT powershell)
4. One command per step
5. Never create unnecessary directories before files
6. Format: echo "content" > full_path_to_file.txt

CORRECT Examples:
- "create hello.txt with html on desktop"
  Response: {"steps": [{"command": "echo <!DOCTYPE html><html><head><title>Hello</title></head><body><h1>Hello</h1></body></html> > ${desktopPath}\\\\hello.txt"}]}

- "create test file with hello world"  
  Response: {"steps": [{"command": "echo hello world > ${homeDir}\\\\Desktop\\\\test.txt"}]}

- "list desktop files"
  Response: {"steps": [{"command": "dir ${desktopPath}"}]}

User Request: ${userInput}

Return ONLY JSON:
`;

	// Use Groq API
	const GROQ_API_KEY = process.env.GROQ_API_KEY;

	if (!GROQ_API_KEY) {
		throw new Error(
			"GROQ_API_KEY not configured. Please add it to environment variables.",
		);
	}

	const response = await axios.post(
		"https://api.groq.com/openai/v1/chat/completions",
		{
			model: "llama-3.3-70b-versatile", // Fast and free!
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0,
		},
		{
			headers: {
				Authorization: `Bearer ${GROQ_API_KEY}`,
				"Content-Type": "application/json",
			},
		},
	);

	const text = response.data.choices[0].message.content.trim();
	console.log("Groq AI output:", text);

	// Extract JSON safely
	const jsonMatch = text.match(/\{[\s\S]*\}/);

	if (!jsonMatch) {
		throw new Error("No valid JSON found in AI output");
	}

	return JSON.parse(jsonMatch[0]);
}
```

---

## 🚀 Deploy Updated Backend

### Step 1: Update Local Code

I'll update the file for you in the next step.

### Step 2: Add Groq Key to Render

1. Go to: https://dashboard.render.com
2. Select your `vortix` service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_xxxxxxxxxxxxx` (your Groq key)
6. Click "Save Changes"

### Step 3: Redeploy

Render will automatically redeploy with the new environment variable.

Or manually:

```bash
cd backend
git add .
git commit -m "Add Groq API support"
git push
```

---

## 📊 Groq Free Tier Limits

- **Requests**: 30 per minute
- **Tokens**: 6,000 per minute
- **Daily**: Unlimited
- **Cost**: FREE forever

**For your use case**: More than enough!

---

## 🧪 Test It

After deploying:

1. Open dashboard: https://vortixredeploy.vercel.app
2. Select your device
3. Type: "create a hello world file on desktop"
4. Click "AI Plan"
5. Should work! ✅

---

## 🆚 Comparison

| Feature | Ollama (Local) | Groq (Cloud) | OpenAI      |
| ------- | -------------- | ------------ | ----------- |
| Cost    | Free           | Free         | Paid        |
| Speed   | Fast           | Very Fast    | Fast        |
| Setup   | Complex        | Easy         | Easy        |
| Cloud   | ❌             | ✅           | ✅          |
| Limit   | Unlimited      | 30/min       | Pay per use |

---

## 🔗 Useful Links

- Groq Console: https://console.groq.com
- API Keys: https://console.groq.com/keys
- Documentation: https://console.groq.com/docs
- Models: https://console.groq.com/docs/models

---

**Get your free Groq key now and I'll update your backend!** 🚀

Just share the key (starts with `gsk_...`) and I'll configure everything.
