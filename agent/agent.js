const WebSocket = require("ws");
const { exec } = require("child_process");
const os = require("os");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const screenshot = require("screenshot-desktop");

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

const CONFIG_FILE = path.join(os.homedir(), '.vortix-config.json');

// Detect platform
const PLATFORM = os.platform(); // 'win32', 'darwin', 'linux'
const IS_WINDOWS = PLATFORM === 'win32';
const IS_MAC = PLATFORM === 'darwin';
const IS_LINUX = PLATFORM === 'linux';

// Load or create config
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("Error loading config:", err.message);
  }
  return {};
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error("Error saving config:", err.message);
  }
}

function promptPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Set a password for this device: ', (password) => {
      rl.close();
      resolve(password.trim());
    });
  });
}

const command = process.argv[2];

if (command === "login") {
  (async () => {
    const password = await promptPassword();
    if (!password) {
      console.log("Password is required");
      return;
    }

    const config = loadConfig();
    config.password = password;
    saveConfig(config);

    console.log("Password saved successfully!");
    console.log("You can now run: vortix start");
    console.log("\nIMPORTANT: Use this same password in the dashboard to access this device.");
  })();
  return;
}

if (command === "start") {
  startAgent();
  return;
}

if (command === "enable-autostart") {
  enableAutoStart();
  return;
}

if (command === "disable-autostart") {
  disableAutoStart();
  return;
}

if (command === "status") {
  checkAutoStartStatus();
  return;
}

console.log("Available commands:");
console.log("  vortix login             - Set device password");
console.log("  vortix start             - Start the agent");
console.log("  vortix enable-autostart  - Enable auto-start on system boot");
console.log("  vortix disable-autostart - Disable auto-start");
console.log("  vortix status            - Check auto-start status");

function startAgent() {
  const config = loadConfig();

  if (!config.password) {
    console.log("Please set a password first: vortix login");
    return;
  }

  const deviceName = os.hostname();
  const deviceToken = `device-${deviceName.toLowerCase()}`;
  const token = `${deviceToken}:${config.password}`;

  console.log(`Device: ${deviceName}`);
  console.log(`Platform: ${PLATFORM} (${IS_WINDOWS ? 'Windows' : IS_MAC ? 'macOS' : IS_LINUX ? 'Linux' : 'Unknown'})`);
  console.log("Connecting to backend...");

  // Production backend URL - Render deployment
  const BACKEND_URL = process.env.BACKEND_URL || 'wss://vortix.onrender.com';

  let ws = null;
  let screenCaptureInterval = null;
  let reconnectTimeout = null;
  let isIntentionalClose = false;

  function connect() {
    ws = new WebSocket(`${BACKEND_URL}?token=${encodeURIComponent(token)}`);

    ws.on("open", () => {
      console.log("Authenticated and connected to backend");

      // Clear any reconnect timeout
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          console.log("Sending heartbeat...");
          ws.send(
            JSON.stringify({
              type: "HEARTBEAT",
              platform: PLATFORM
            })
          );
        }
      }, 5000);
    });

    ws.on("close", () => {
      console.log("Disconnected from backend");

      // Clean up screen capture
      if (screenCaptureInterval) {
        clearInterval(screenCaptureInterval);
        screenCaptureInterval = null;
      }

      // Auto-reconnect unless it was intentional
      if (!isIntentionalClose) {
        console.log("Attempting to reconnect in 5 seconds...");
        reconnectTimeout = setTimeout(() => {
          console.log("Reconnecting...");
          connect();
        }, 5000);
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err.message);
    });

    let commandQueue = [];
    let isRunning = false;
    let currentCwd = require("os").homedir(); // Track current working directory

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "EXECUTE") {
          console.log("Agent received EXECUTE:", data.command);
          commandQueue.push(data.command);
          processQueue();
        }

        if (data.type === "START_SCREEN_CAPTURE") {
          console.log("🎥 Starting screen capture...");
          if (!screenCaptureInterval) {
            screenCaptureInterval = setInterval(async () => {
              try {
                console.log("📸 Capturing frame...");
                const img = await screenshot({ format: 'jpg' });
                const base64 = img.toString('base64');
                console.log(`✅ Frame captured: ${img.length} bytes, base64: ${base64.length} chars`);

                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: "SCREEN_FRAME",
                    frame: base64
                  }));
                  console.log("📤 Frame sent to backend");
                } else {
                  console.log("⚠️ WebSocket not open, skipping frame");
                }
              } catch (err) {
                console.error("❌ Screen capture error:", err.message);
                console.error(err.stack);
              }
            }, 1000); // Capture every 1 second
            console.log("✅ Screen capture interval started");
          } else {
            console.log("⚠️ Screen capture already running");
          }
        }

        if (data.type === "STOP_SCREEN_CAPTURE") {
          console.log("Stopping screen capture...");
          if (screenCaptureInterval) {
            clearInterval(screenCaptureInterval);
            screenCaptureInterval = null;
          }
        }

        if (data.type === "ENABLE_AUTOSTART") {
          console.log("Received request to enable auto-start...");
          try {
            enableAutoStart();
            ws.send(JSON.stringify({
              type: "AUTOSTART_STATUS",
              enabled: true,
              message: "Auto-start enabled successfully"
            }));
          } catch (err) {
            ws.send(JSON.stringify({
              type: "AUTOSTART_ERROR",
              message: err.message
            }));
          }
        }

        if (data.type === "DISABLE_AUTOSTART") {
          console.log("Received request to disable auto-start...");
          try {
            disableAutoStart();
            ws.send(JSON.stringify({
              type: "AUTOSTART_STATUS",
              enabled: false,
              message: "Auto-start disabled successfully"
            }));
          } catch (err) {
            ws.send(JSON.stringify({
              type: "AUTOSTART_ERROR",
              message: err.message
            }));
          }
        }

        if (data.type === "GET_AUTOSTART_STATUS") {
          const config = loadConfig();
          ws.send(JSON.stringify({
            type: "AUTOSTART_STATUS",
            enabled: config.autoStart || false
          }));
        }

      } catch (err) {
        console.error("Invalid message received:", message.toString());
      }
    });

    function extractDirectoryFromCommand(command) {
      // Check for cd commands and extract the target directory
      // Handle: cd /d D:, cd /D D:\, cd D:\folder, etc.

      // Match: cd /d D: or cd /D D: or similar
      let match = command.match(/^\s*cd\s+\/[dD]\s+([^\s]+)\s*$/i);
      if (match) {
        let path = match[1].trim();
        path = expandPath(path);
        // Ensure it ends with backslash if it's just a drive letter
        if (/^[A-Za-z]:$/.test(path)) {
          path = path + "\\";
        }
        console.log("CD detected, new path:", path);
        return path;
      }

      // Match: cd D:\folder or cd folder
      match = command.match(/^\s*cd\s+([^\s][^\s]*)\s*$/i);
      if (match) {
        let path = match[1].trim();
        path = expandPath(path);
        // Only treat as cd if it looks like a path (has : or starts with \)
        if (/[:\\]/.test(path)) {
          if (/^[A-Za-z]:$/.test(path)) {
            path = path + "\\";
          }
          console.log("CD detected, new path:", path);
          return path;
        }
      }

      return null;
    }

    function expandPath(path) {
      // Expand environment variables
      if (path.includes("%USERPROFILE%")) {
        path = path.replace(/%USERPROFILE%/gi, os.homedir());
      }
      if (path.includes("%HOMEPATH%")) {
        path = path.replace(/%HOMEPATH%/gi, os.homedir());
      }
      if (path.includes("%HOMEDRIVE%")) {
        const homedir = os.homedir();
        const drive = homedir.split("\\")[0];
        path = path.replace(/%HOMEDRIVE%/gi, drive);
      }
      return path;
    }

    function processQueue() {
      if (isRunning || commandQueue.length === 0) return;

      isRunning = true;
      let command = commandQueue.shift();

      console.log("Executing command:", command);

      // Update current working directory if this is a cd command
      const newCwd = extractDirectoryFromCommand(command);
      if (newCwd) {
        currentCwd = newCwd;
        ws.send(JSON.stringify({ type: "LOG", deviceName, message: `Directory changed to: ${currentCwd}` }));
        console.log("Directory state updated to:", currentCwd);
      }

      // report current cwd for diagnostics
      ws.send(JSON.stringify({ type: "LOG", deviceName, message: `Working from: ${currentCwd}` }));
      ws.send(JSON.stringify({ type: "LOG", deviceName, message: `Executing: ${command}` }));

      // Platform-specific shell
      const shell = IS_WINDOWS ? "cmd.exe" : IS_MAC || IS_LINUX ? "/bin/bash" : "sh";
      const shellFlag = IS_WINDOWS ? "/c" : "-c";

      // Use platform-appropriate shell
      const process = exec(command, {
        cwd: currentCwd,
        shell: shell,
        maxBuffer: 10 * 1024 * 1024,  // 10MB buffer for large outputs
        encoding: "utf8"
      });

      // Track if we've received any output
      let hasOutput = false;

      process.stdout.on("data", (data) => {
        hasOutput = true;
        ws.send(JSON.stringify({
          type: "LOG",
          deviceName,
          message: data.toString()
        }));
      });

      process.stderr.on("data", (data) => {
        hasOutput = true;
        ws.send(JSON.stringify({
          type: "LOG",
          deviceName,
          message: `[ERROR] ${data.toString()}`
        }));
      });

      process.on("error", (err) => {
        ws.send(JSON.stringify({
          type: "LOG",
          deviceName,
          message: `[EXEC ERROR] ${err.message}`
        }));
      });

      process.on("close", (code) => {
        ws.send(JSON.stringify({
          type: "LOG",
          deviceName,
          message: `Command execution finished with code: ${code}`
        }));

        // Send structured result so server can orchestrate sequential steps
        ws.send(JSON.stringify({
          type: "EXECUTE_RESULT",
          command,
          code: typeof code === 'number' ? code : 0
        }));

        isRunning = false;
        processQueue();
      });
    }
  }

  // Start the connection
  connect();

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n\nShutting down gracefully...');
    isIntentionalClose = true;

    if (screenCaptureInterval) {
      clearInterval(screenCaptureInterval);
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }

    console.log('Agent stopped.');
    process.exit(0);
  });
}


// ========== AUTO-START FUNCTIONALITY ==========

function enableAutoStart() {
  console.log("Enabling auto-start on system boot...");

  const config = loadConfig();
  if (!config.password) {
    console.log("❌ Error: Please set a password first using 'vortix login'");
    return;
  }

  try {
    if (IS_WINDOWS) {
      enableAutoStartWindows();
    } else if (IS_MAC) {
      enableAutoStartMac();
    } else if (IS_LINUX) {
      enableAutoStartLinux();
    } else {
      console.log("❌ Unsupported platform");
      return;
    }

    config.autoStart = true;
    saveConfig(config);
    console.log("✅ Auto-start enabled successfully!");
    console.log("   The agent will start automatically on system boot.");
  } catch (err) {
    console.error("❌ Failed to enable auto-start:", err.message);
  }
}

function disableAutoStart() {
  console.log("Disabling auto-start...");

  try {
    if (IS_WINDOWS) {
      disableAutoStartWindows();
    } else if (IS_MAC) {
      disableAutoStartMac();
    } else if (IS_LINUX) {
      disableAutoStartLinux();
    } else {
      console.log("❌ Unsupported platform");
      return;
    }

    const config = loadConfig();
    config.autoStart = false;
    saveConfig(config);
    console.log("✅ Auto-start disabled successfully!");
  } catch (err) {
    console.error("❌ Failed to disable auto-start:", err.message);
  }
}

function checkAutoStartStatus() {
  const config = loadConfig();
  console.log("\n=== Vortix Agent Status ===");
  console.log(`Platform: ${PLATFORM} (${IS_WINDOWS ? 'Windows' : IS_MAC ? 'macOS' : IS_LINUX ? 'Linux' : 'Unknown'})`);
  console.log(`Device: ${os.hostname()}`);
  console.log(`Password Set: ${config.password ? '✅ Yes' : '❌ No'}`);
  console.log(`Auto-start: ${config.autoStart ? '✅ Enabled' : '❌ Disabled'}`);
  console.log("===========================\n");
}

// ========== WINDOWS AUTO-START ==========

function enableAutoStartWindows() {
  const { execSync } = require('child_process');

  // Get the path to node and the agent script
  const nodePath = process.execPath;
  const agentPath = __filename;

  // Create a VBScript to run the agent silently (no console window)
  const vbsPath = path.join(os.homedir(), 'vortix-agent.vbs');
  const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """${nodePath}"" ""${agentPath}"" start", 0, False`;

  fs.writeFileSync(vbsPath, vbsContent);

  // Add to Windows Task Scheduler
  const taskName = "VortixAgent";
  const command = `schtasks /create /tn "${taskName}" /tr "${vbsPath}" /sc onlogon /rl highest /f`;

  try {
    execSync(command, { stdio: 'ignore' });
    console.log("   Created Windows Task Scheduler entry");
  } catch (err) {
    throw new Error("Failed to create scheduled task. Try running as administrator.");
  }
}

function disableAutoStartWindows() {
  const { execSync } = require('child_process');

  const taskName = "VortixAgent";
  const command = `schtasks /delete /tn "${taskName}" /f`;

  try {
    execSync(command, { stdio: 'ignore' });
    console.log("   Removed Windows Task Scheduler entry");
  } catch (err) {
    // Task might not exist, that's okay
  }

  // Remove VBScript file
  const vbsPath = path.join(os.homedir(), 'vortix-agent.vbs');
  if (fs.existsSync(vbsPath)) {
    fs.unlinkSync(vbsPath);
  }
}

// ========== macOS AUTO-START ==========

function enableAutoStartMac() {
  const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.vortix.agent.plist');

  // Get the path to node and the agent script
  const nodePath = process.execPath;
  const agentPath = __filename;

  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.vortix.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${agentPath}</string>
        <string>start</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${os.homedir()}/Library/Logs/vortix-agent.log</string>
    <key>StandardErrorPath</key>
    <string>${os.homedir()}/Library/Logs/vortix-agent-error.log</string>
</dict>
</plist>`;

  // Create LaunchAgents directory if it doesn't exist
  const launchAgentsDir = path.join(os.homedir(), 'Library', 'LaunchAgents');
  if (!fs.existsSync(launchAgentsDir)) {
    fs.mkdirSync(launchAgentsDir, { recursive: true });
  }

  fs.writeFileSync(plistPath, plistContent);

  // Load the launch agent
  const { execSync } = require('child_process');
  try {
    execSync(`launchctl load ${plistPath}`, { stdio: 'ignore' });
    console.log("   Created macOS LaunchAgent");
  } catch (err) {
    console.log("   Created LaunchAgent (will load on next login)");
  }
}

function disableAutoStartMac() {
  const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.vortix.agent.plist');

  if (fs.existsSync(plistPath)) {
    const { execSync } = require('child_process');
    try {
      execSync(`launchctl unload ${plistPath}`, { stdio: 'ignore' });
    } catch (err) {
      // Might not be loaded, that's okay
    }

    fs.unlinkSync(plistPath);
    console.log("   Removed macOS LaunchAgent");
  }
}

// ========== LINUX AUTO-START ==========

function enableAutoStartLinux() {
  const servicePath = path.join(os.homedir(), '.config', 'systemd', 'user', 'vortix-agent.service');

  // Get the path to node and the agent script
  const nodePath = process.execPath;
  const agentPath = __filename;

  const serviceContent = `[Unit]
Description=Vortix Agent - Remote OS Control
After=network.target

[Service]
Type=simple
ExecStart=${nodePath} ${agentPath} start
Restart=always
RestartSec=10

[Install]
WantedBy=default.target`;

  // Create systemd user directory if it doesn't exist
  const systemdDir = path.join(os.homedir(), '.config', 'systemd', 'user');
  if (!fs.existsSync(systemdDir)) {
    fs.mkdirSync(systemdDir, { recursive: true });
  }

  fs.writeFileSync(servicePath, serviceContent);

  // Enable and start the service
  const { execSync } = require('child_process');
  try {
    execSync('systemctl --user daemon-reload', { stdio: 'ignore' });
    execSync('systemctl --user enable vortix-agent.service', { stdio: 'ignore' });
    execSync('systemctl --user start vortix-agent.service', { stdio: 'ignore' });
    console.log("   Created systemd user service");
  } catch (err) {
    console.log("   Created service file (enable with: systemctl --user enable vortix-agent.service)");
  }
}

function disableAutoStartLinux() {
  const servicePath = path.join(os.homedir(), '.config', 'systemd', 'user', 'vortix-agent.service');

  if (fs.existsSync(servicePath)) {
    const { execSync } = require('child_process');
    try {
      execSync('systemctl --user stop vortix-agent.service', { stdio: 'ignore' });
      execSync('systemctl --user disable vortix-agent.service', { stdio: 'ignore' });
    } catch (err) {
      // Might not be running, that's okay
    }

    fs.unlinkSync(servicePath);
    console.log("   Removed systemd user service");
  }
}
