# 🔧 App Opening Fix - Platform-Specific Commands

## 🔴 Issue

When saying "open notion" on Windows, the AI was generating Linux commands:

```
Command: notion-app
Error: 'notion-app' is not recognized ❌
```

## ✅ Solution

Made the AI prompt more explicit about platform-specific commands.

### What Changed:

**Added stronger platform emphasis:**

```javascript
PLATFORM: WINDOWS - You MUST use Windows commands ONLY!
USE WINDOWS COMMANDS ONLY! Use "start" command for opening apps!
```

**Platform-specific examples:**

```javascript
// Windows
- "open notion" → start notion://
- "open spotify" → start spotify:
- ANY APP → start <appname>

// macOS
- "open notion" → open -a Notion
- ANY APP → open -a "<AppName>"

// Linux
- "open notion" → notion-app
- ANY APP → <appname>
```

---

## 🎯 Expected Behavior Now

### Windows (Your System):

**Input:** "open notion" **Command:** `start notion://` ✅

**Input:** "open spotify" **Command:** `start spotify:` ✅

**Input:** "open vscode" **Command:** `code` ✅

---

### macOS:

**Input:** "open notion" **Command:** `open -a Notion` ✅

**Input:** "open spotify" **Command:** `open -a Spotify` ✅

---

### Linux:

**Input:** "open notion" **Command:** `notion-app` ✅

**Input:** "open spotify" **Command:** `spotify` ✅

---

## 🧪 Testing

### Local Testing:

1. **Restart backend** (to load updated code):

   ```cmd
   # Stop current backend (Ctrl+C)
   START_LOCAL_BACKEND.bat
   ```

2. **Keep agent running**

3. **Test in dashboard:**
   ```
   "open notion" → Should generate: start notion://
   "open spotify" → Should generate: start spotify:
   "open vscode" → Should generate: code
   ```

---

### Production Testing:

1. **Commit and push:**

   ```bash
   git add backend/server.js
   git commit -m "Fix: Make AI use platform-specific commands for opening apps"
   git push
   ```

2. **Wait for Render deployment** (2-3 minutes)

3. **Test in production dashboard**

---

## 📊 Common Apps - Windows Commands

| App        | Command            |
| ---------- | ------------------ |
| Notion     | `start notion://`  |
| Spotify    | `start spotify:`   |
| Discord    | `start discord://` |
| Slack      | `start slack://`   |
| VS Code    | `code`             |
| Chrome     | `start chrome`     |
| Firefox    | `start firefox`    |
| Edge       | `start msedge`     |
| Notepad    | `start notepad`    |
| Calculator | `start calc`       |

---

## 🐛 If It Still Doesn't Work

### Check Platform Detection:

**In agent terminal, you should see:**

```
Platform: win32 (Windows)
```

**If it shows something else:**

- Agent might not be sending platform info
- Backend might not be receiving it

### Manual Test:

**Try direct command:**

```
start notion://
```

**If this works:**

- Notion is installed ✅
- Protocol is registered ✅
- AI just needs to generate correct command

**If this doesn't work:**

- Notion might not be installed
- Or protocol not registered
- Try: `start notion` instead

---

## 💡 Fallback Commands

If protocol doesn't work, try these:

### Windows:

```cmd
# Try app name directly
start notion

# Try executable
start "C:\Users\YourName\AppData\Local\Programs\Notion\Notion.exe"

# Try searching
where notion
```

### Find Installed Apps:

```cmd
# Check Program Files
dir "C:\Program Files"
dir "C:\Program Files (x86)"

# Check AppData
dir "%LOCALAPPDATA%\Programs"
```

---

## ✅ Verification

### After deploying the fix:

**Test these commands:**

1. "open notion" → Should generate `start notion://`
2. "open spotify" → Should generate `start spotify:`
3. "open vscode" → Should generate `code`
4. "open chrome" → Should generate `start chrome`

**All should use Windows commands!** ✅

---

## 🚀 Next Steps

1. **Restart local backend** to test immediately
2. **Commit and push** to deploy to production
3. **Test** with various apps
4. **Verify** commands are platform-specific

---

**The AI will now generate correct Windows commands!** 🎉

No more Linux commands on Windows! 🚀
