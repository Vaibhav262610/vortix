# 📱 Opening Applications - Command Reference

## ✅ Fixed: Apps vs Websites

The AI now prioritizes **installed applications** over websites when you say
"open [app name]".

---

## 🪟 Windows Commands

### Popular Apps

| Say This       | Opens           | Command            |
| -------------- | --------------- | ------------------ |
| "open notion"  | Notion app      | `start notion://`  |
| "open spotify" | Spotify app     | `start spotify:`   |
| "open discord" | Discord app     | `start discord://` |
| "open slack"   | Slack app       | `start slack://`   |
| "open vscode"  | VS Code         | `code`             |
| "open chrome"  | Chrome browser  | `start chrome`     |
| "open firefox" | Firefox browser | `start firefox`    |
| "open edge"    | Edge browser    | `start msedge`     |

### Built-in Apps

| Say This            | Opens            | Command              |
| ------------------- | ---------------- | -------------------- |
| "open notepad"      | Notepad          | `start notepad`      |
| "open calculator"   | Calculator       | `start calc`         |
| "open paint"        | Paint            | `start mspaint`      |
| "open explorer"     | File Explorer    | `start explorer`     |
| "open settings"     | Windows Settings | `start ms-settings:` |
| "open task manager" | Task Manager     | `start taskmgr`      |

### Opening Websites

| Say This              | Opens                | Command                     |
| --------------------- | -------------------- | --------------------------- |
| "open notion website" | Notion.so in browser | `start https://notion.so`   |
| "open google"         | Google.com           | `start https://google.com`  |
| "open youtube"        | YouTube              | `start https://youtube.com` |

---

## 🍎 macOS Commands

### Popular Apps

| Say This       | Opens           | Command                        |
| -------------- | --------------- | ------------------------------ |
| "open notion"  | Notion app      | `open -a Notion`               |
| "open spotify" | Spotify app     | `open -a Spotify`              |
| "open discord" | Discord app     | `open -a Discord`              |
| "open slack"   | Slack app       | `open -a Slack`                |
| "open vscode"  | VS Code         | `open -a "Visual Studio Code"` |
| "open chrome"  | Chrome browser  | `open -a "Google Chrome"`      |
| "open safari"  | Safari browser  | `open -a Safari`               |
| "open firefox" | Firefox browser | `open -a Firefox`              |

### Built-in Apps

| Say This        | Opens    | Command            |
| --------------- | -------- | ------------------ |
| "open textedit" | TextEdit | `open -a TextEdit` |
| "open finder"   | Finder   | `open -a Finder`   |
| "open terminal" | Terminal | `open -a Terminal` |
| "open mail"     | Mail     | `open -a Mail`     |
| "open calendar" | Calendar | `open -a Calendar` |
| "open notes"    | Notes    | `open -a Notes`    |

### Opening Websites

| Say This              | Opens                | Command                    |
| --------------------- | -------------------- | -------------------------- |
| "open notion website" | Notion.so in browser | `open https://notion.so`   |
| "open google"         | Google.com           | `open https://google.com`  |
| "open youtube"        | YouTube              | `open https://youtube.com` |

---

## 🐧 Linux Commands

### Popular Apps

| Say This       | Opens           | Command                     |
| -------------- | --------------- | --------------------------- |
| "open notion"  | Notion app      | `notion-app` (if installed) |
| "open spotify" | Spotify app     | `spotify`                   |
| "open discord" | Discord app     | `discord`                   |
| "open slack"   | Slack app       | `slack`                     |
| "open vscode"  | VS Code         | `code`                      |
| "open chrome"  | Chrome browser  | `google-chrome`             |
| "open firefox" | Firefox browser | `firefox`                   |

### Built-in Apps

| Say This            | Opens        | Command                       |
| ------------------- | ------------ | ----------------------------- |
| "open terminal"     | Terminal     | `gnome-terminal` or `konsole` |
| "open file manager" | File Manager | `xdg-open .`                  |
| "open text editor"  | Text Editor  | `gedit` or `kate`             |

### Opening Websites

| Say This              | Opens                | Command                        |
| --------------------- | -------------------- | ------------------------------ |
| "open notion website" | Notion.so in browser | `xdg-open https://notion.so`   |
| "open google"         | Google.com           | `xdg-open https://google.com`  |
| "open youtube"        | YouTube              | `xdg-open https://youtube.com` |

---

## 🎯 How It Works Now

### Before (Wrong):

```
You: "open notion"
AI: Opens https://notion.so in browser ❌
```

### After (Correct):

```
You: "open notion"
AI: Opens Notion app ✅
```

### If You Want the Website:

```
You: "open notion website"
AI: Opens https://notion.so in browser ✅
```

---

## 📝 Examples

### Opening Apps

**Windows:**

```
"open notion" → start notion://
"open spotify" → start spotify:
"open vscode" → code
```

**macOS:**

```
"open notion" → open -a Notion
"open spotify" → open -a Spotify
"open vscode" → open -a "Visual Studio Code"
```

**Linux:**

```
"open notion" → notion-app
"open spotify" → spotify
"open vscode" → code
```

---

### Opening Websites

**All Platforms:**

```
"open notion website" → Opens in browser
"open google" → Opens google.com
"open youtube" → Opens youtube.com
"open github" → Opens github.com
```

---

## 🔧 Custom Apps

### If App Not Recognized

**Windows:**

```
Direct command: start <appname>
Example: start obsidian://
```

**macOS:**

```
Direct command: open -a "<AppName>"
Example: open -a "Obsidian"
```

**Linux:**

```
Direct command: <appname>
Example: obsidian
```

---

## 💡 Pro Tips

### Tip 1: Use Direct Commands

If AI doesn't recognize your app, use direct commands:

**Windows:**

```
start myapp://
```

**macOS:**

```
open -a "My App"
```

**Linux:**

```
myapp
```

---

### Tip 2: Check App Protocol

Some apps have custom protocols:

- Notion: `notion://`
- Spotify: `spotify:`
- Discord: `discord://`
- Slack: `slack://`
- VS Code: `vscode://`
- Obsidian: `obsidian://`

**Use:** `start <protocol>` on Windows

---

### Tip 3: Find App Name (macOS)

```bash
ls /Applications/
```

Then use:

```bash
open -a "App Name"
```

---

## 🎯 Testing

### Test the Fix

1. **Start local backend** (with updated code)
2. **Start agent**
3. **Open dashboard**
4. **Try these commands:**

```
"open notion" → Should open Notion app ✅
"open spotify" → Should open Spotify app ✅
"open notion website" → Should open browser ✅
```

---

## 📊 Supported Apps

### Windows

- ✅ Notion, Spotify, Discord, Slack
- ✅ VS Code, Chrome, Firefox, Edge
- ✅ Notepad, Calculator, Paint, Explorer
- ✅ Any app with protocol (app://)

### macOS

- ✅ Notion, Spotify, Discord, Slack
- ✅ VS Code, Chrome, Safari, Firefox
- ✅ TextEdit, Finder, Terminal, Mail
- ✅ Any app in /Applications/

### Linux

- ✅ Apps in PATH
- ✅ Common apps (spotify, discord, code)
- ✅ Desktop apps via .desktop files

---

## ✅ Summary

**What Changed:**

- AI now prioritizes installed apps over websites
- "open notion" → Opens Notion app (not website)
- "open notion website" → Opens website in browser

**How to Use:**

- Say "open [app name]" for installed apps
- Say "open [app name] website" for websites
- Use direct commands for custom apps

**Supported:**

- ✅ Windows (start, protocols)
- ✅ macOS (open -a)
- ✅ Linux (direct commands, xdg-open)

---

**Apps now open correctly!** 🎉

The AI will prioritize installed applications over websites! 🚀
