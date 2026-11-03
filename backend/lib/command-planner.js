const axios = require('axios');
const { selectGroqKey, generateGroqPlan } = require('./groq-planning');

async function generatePlan(userInput, platform, userApiKey = null) {
  // Platform-specific command patterns
  const isWindows = platform === 'win32';
  const isMac = platform === 'darwin';
  const isLinux = platform === 'linux';
  // Commands run on the agent, so use paths that expand on that device.
  const homeDir = isWindows ? '%USERPROFILE%' : '$HOME';
  const desktopPath = isWindows ? '%USERPROFILE%\\Desktop' : '$HOME/Desktop';

  let platformInstructions = '';

  if (isWindows) {
    platformInstructions = `
WINDOWS COMMAND PATTERNS:

File Operations:
- Create text file: echo Hello World > ${desktopPath}\\\\file.txt
- Create HTML: echo ^<!DOCTYPE html^>^<html^>^<body^>Hello^</body^>^</html^> > ${desktopPath}\\\\page.html
- Create directory: mkdir ${desktopPath}\\\\newfolder
- Copy file: copy source.txt ${desktopPath}\\\\destination.txt
- Delete file: del ${desktopPath}\\\\file.txt
- List files: dir ${desktopPath}

System Operations:
- Open file: start ${desktopPath}\\\\file.txt
- Open folder: explorer ${desktopPath}
- System info: systeminfo
- Network info: ipconfig
- Process list: tasklist
- Lock PC: rundll32.exe user32.dll,LockWorkStation
- Shutdown: shutdown /s /t 0
- Restart: shutdown /r /t 0

Opening Applications (ALWAYS prefer installed apps over websites):
- Open Notion app: start notion://
- Open Spotify app: start spotify:
- Open Discord app: start discord://
- Open Slack app: start slack://
- Open VS Code: code
- Open Chrome: start chrome
- Open Firefox: start firefox
- Open Edge: start msedge
- Open Notepad: start notepad
- Open Calculator: start calc
- Open Paint: start mspaint
- Open File Explorer: start explorer
- Generic app: start <appname>

IMPORTANT: When user says "open [app name]", ALWAYS try to open the installed application first using "start <appname>" or "start <appname>://". Only open websites if explicitly asked for "website" or "browser".

EXAMPLES:
Request: "open notion"
Response: {"steps": [{"command": "start notion://"}]}

Request: "open notion website"
Response: {"steps": [{"command": "start https://notion.so"}]}

Request: "open spotify"
Response: {"steps": [{"command": "start spotify:"}]}

Request: "create hello.html on desktop"
Response: {"steps": [{"command": "echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>Hello^</title^>^</head^>^<body^>^<h1^>Hello World^</h1^>^</body^>^</html^> > ${desktopPath}\\\\hello.html"}]}
`;
  } else if (isMac || isLinux) {
    platformInstructions = `
${isMac ? 'macOS' : 'LINUX'} COMMAND PATTERNS:

File Operations:
- Create text file: echo "Hello World" > ${desktopPath}/file.txt
- Create HTML: echo '<!DOCTYPE html><html><body>Hello</body></html>' > ${desktopPath}/page.html
- Create directory: mkdir -p ${desktopPath}/newfolder
- Copy file: cp source.txt ${desktopPath}/destination.txt
- Delete file: rm ${desktopPath}/file.txt
- List files: ls -la ${desktopPath}

System Operations:
- Open file: ${isMac ? 'open' : 'xdg-open'} ${desktopPath}/file.txt
- Open folder: ${isMac ? 'open' : 'xdg-open'} ${desktopPath}
- System info: ${isMac ? 'system_profiler SPSoftwareDataType' : 'uname -a'}
- Network info: ifconfig
- Process list: ps aux
${isMac ? '- Lock screen: pmset displaysleepnow' : '- Lock screen: gnome-screensaver-command -l'}
${isMac ? '- Shutdown: sudo shutdown -h now' : '- Shutdown: sudo shutdown -h now'}
${isMac ? '- Restart: sudo shutdown -r now' : '- Restart: sudo reboot'}

Opening Applications (ALWAYS prefer installed apps over websites):
${isMac ? `- Open Notion app: open -a Notion
- Open Spotify app: open -a Spotify
- Open Discord app: open -a Discord
- Open Slack app: open -a Slack
- Open VS Code: open -a "Visual Studio Code"
- Open Chrome: open -a "Google Chrome"
- Open Safari: open -a Safari
- Open Firefox: open -a Firefox
- Generic app: open -a "<AppName>"` : `- Text Editor: gedit (or nano, vim, kate)
- Open Notion: notion-app (if installed)
- Open Spotify: spotify (if installed)
- Open VS Code: code
- Open Chrome: google-chrome
- Open Firefox: firefox
- File Manager: nautilus or dolphin or thunar
- Terminal: gnome-terminal or konsole or xterm
- Calculator: gnome-calculator or kcalc
- Generic app: <appname> (just the command name, no paths)

IMPORTANT FOR LINUX:
- Notepad does NOT exist on Linux. Use: gedit, nano, vim, or kate instead
- Paint does NOT exist on Linux. Use: gimp, krita, or kolourpaint instead
- Calculator: use gnome-calculator or kcalc
- DO NOT use xdg-open with app names, just run the app command directly`}

IMPORTANT: When user says "open [app name]", ALWAYS try to open the installed application first. Only open websites if explicitly asked for "website" or "browser".

EXAMPLES:
Request: "open notion"
Response: {"steps": [{"command": "${isMac ? 'open -a Notion' : 'notion-app'}"}]}

Request: "open notepad" (Linux)
Response: {"steps": [{"command": "gedit"}]}

Request: "start text editor" (Linux)
Response: {"steps": [{"command": "gedit"}]}

Request: "open notion website"
Response: {"steps": [{"command": "${isMac ? 'open' : 'xdg-open'} https://notion.so"}]}

Request: "create hello.html on desktop"
Response: {"steps": [{"command": "echo '<!DOCTYPE html><html><head><title>Hello</title></head><body><h1>Hello World</h1></body></html>' > ${desktopPath}/hello.html"}]}
`;
  }

  const prompt = `
You are an expert ${isWindows ? 'Windows' : isMac ? 'macOS' : 'Linux'} command-line assistant. Generate precise, executable ${isWindows ? 'Windows' : isMac ? 'macOS' : 'Linux'} commands for the user's request.

PLATFORM: ${isWindows ? 'WINDOWS' : isMac ? 'macOS' : 'LINUX'} - You MUST use ${isWindows ? 'Windows' : isMac ? 'macOS' : 'Linux'} commands ONLY!

System Information:
- Home Directory: ${homeDir}
- Desktop Path: ${desktopPath}
- Platform: ${platform} (${isWindows ? 'Windows' : isMac ? 'macOS' : 'Linux'})

CRITICAL RULES:
1. Return ONLY valid JSON: {"steps": [{"command": "exact_command_here"}]}
2. Use ABSOLUTE paths appropriate for ${isWindows ? 'Windows (backslashes)' : 'Unix (forward slashes)'}
3. For file creation: use appropriate echo syntax for the platform
4. Break complex tasks into simple, sequential steps
5. Test each command mentally before including it
6. IMPORTANT: When user says "open [app name]", ALWAYS open the INSTALLED APPLICATION, NOT the website
7. Only open websites if user explicitly says "website", "browser", or provides a URL
8. ${isWindows ? 'USE WINDOWS COMMANDS ONLY! Use "start" command for opening apps!' : isMac ? 'USE macOS COMMANDS ONLY! Use "open -a" for apps!' : 'USE LINUX COMMANDS ONLY!'}

APPLICATION OPENING ${isWindows ? '(WINDOWS)' : isMac ? '(macOS)' : '(LINUX)'}:
${isWindows ? `- "open notion" → start notion://
- "open spotify" → start spotify:
- "open vscode" → code
- "open chrome" → start chrome
- ANY APP → start <appname> or start <appname>://` : isMac ? `- "open notion" → open -a Notion
- "open spotify" → open -a Spotify
- "open vscode" → open -a "Visual Studio Code"
- ANY APP → open -a "<AppName>"` : `- "open notion" → notion-app (if installed)
- "open spotify" → spotify
- "open vscode" → code
- ANY APP → <appname> or xdg-open <appname>`}

${platformInstructions}

User Request: ${userInput}

Return ONLY JSON with executable commands:
`;

  // The backend's Groq key takes precedence over an optional browser key.
  const groqKey = selectGroqKey(process.env.GROQ_API_KEY, userApiKey);

  if (groqKey) {
    return generateGroqPlan(prompt, groqKey);
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GROQ_API_KEY is missing on the backend. Set it on Render and redeploy.');
    }
    // Fallback to Ollama (local only)
    console.log("Using Ollama for AI planning (local only)");
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

    try {
      const response = await axios.post(
        `${ollamaUrl.replace(/\/$/, '')}/api/generate`,
        {
          model: "qwen2.5:7b",
          prompt: prompt,
          stream: false
        },
        {
          timeout: 10000
        }
      );

      const text = response.data.response.trim();
      console.log("Ollama output:", text);

      // Extract JSON safely
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No valid JSON found in LLM output");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Ollama connection error:", error.message);
      throw new Error("AI planning is not available. Ollama is not running or not accessible. Please use direct commands instead.");
    }
  }
}

module.exports = { generatePlan };
