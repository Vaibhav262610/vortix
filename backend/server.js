const WebSocket = require("ws");
const readline = require("readline");
const axios = require("axios");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

// Use environment PORT for cloud deployment, fallback to 8080 for local
const PORT = process.env.PORT || 8080;

const dashboardClients = new Set();
const devices = new Map(); // deviceId -> { deviceName, password, status, ws, lastSeen }
const pendingResults = new Map();

// Helper to hash passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const wss = new WebSocket.Server({ port: PORT });

console.log(`Backend running on port ${PORT}`);

function waitForExecuteResult(deviceName, command, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const list = pendingResults.get(deviceName) || [];
    const entry = { command, resolve, reject, timer: null };
    // timeout
    entry.timer = setTimeout(() => {
      // remove entry
      const arr = pendingResults.get(deviceName) || [];
      const idx = arr.indexOf(entry);
      if (idx !== -1) arr.splice(idx, 1);
      pendingResults.set(deviceName, arr);
      reject(new Error('Timed out waiting for EXECUTE_RESULT'));
    }, timeoutMs);

    list.push(entry);
    pendingResults.set(deviceName, list);
  });
}

// ---------- WebSocket Handling ----------
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");

  const token = url.searchParams.get("token");
  const clientType = url.searchParams.get("type");

  // ===== DASHBOARD CONNECTION =====
  if (clientType === "dashboard") {
    ws.authenticatedDevices = new Set(); // Track which devices this dashboard can access
    dashboardClients.add(ws);
    console.log("Dashboard connected");

    ws.on("message", async (message) => {
      const data = JSON.parse(message);

      // Dashboard authenticates to view a specific device
      if (data.type === "AUTH_DEVICE") {
        const { deviceName, password } = data;
        const deviceId = `device-${deviceName.toLowerCase()}`;
        const device = devices.get(deviceId);

        if (!device) {
          ws.send(JSON.stringify({
            type: "AUTH_ERROR",
            deviceName,
            error: "Device not found"
          }));
          return;
        }

        if (device.passwordHash !== hashPassword(password)) {
          ws.send(JSON.stringify({
            type: "AUTH_ERROR",
            deviceName,
            error: "Invalid password"
          }));
          return;
        }

        // Authentication successful
        ws.authenticatedDevices.add(deviceId);
        ws.send(JSON.stringify({
          type: "AUTH_SUCCESS",
          deviceName
        }));

        // Send updated device list
        broadcastDevicesToDashboard(ws);
        return;
      }

      if (data.type === "FORCE_EXECUTE") {
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: "Not authenticated for this device"
          }));
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") return;

        targetDevice.ws.send(
          JSON.stringify({
            type: "EXECUTE",
            command: data.command,
          })
        );
      }

      if (data.type === "APPROVE_PLAN") {
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: "Not authenticated for this device"
          }));
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") {
          ws.send(JSON.stringify({
            type: "EXECUTION_FINISHED",
            deviceName: data.deviceName,
            error: "Device not found or offline"
          }));
          return;
        }

        // Notify dashboard execution started
        ws.send(JSON.stringify({
          type: "EXECUTION_STARTED",
          deviceName: data.deviceName
        }));

        // Execute steps sequentially
        (async () => {
          let aborted = false;
          for (const step of data.steps) {
            const commandToExecute = step.command || step;

            targetDevice.ws.send(
              JSON.stringify({
                type: "EXECUTE",
                command: commandToExecute
              })
            );

            try {
              const result = await waitForExecuteResult(targetDevice.deviceName, commandToExecute);

              ws.send(JSON.stringify({
                type: "LOG",
                deviceName: targetDevice.deviceName,
                message: `✓ Step completed: ${commandToExecute} (exit code: ${result.code})`
              }));

              if (typeof result.code === 'number' && result.code !== 0) {
                console.log(`Step exited with code ${result.code}`);
              }
            } catch (err) {
              ws.send(JSON.stringify({
                type: "LOG",
                deviceName: targetDevice.deviceName,
                message: `✗ Step failed: ${commandToExecute} - ${err.message}`
              }));
              ws.send(JSON.stringify({
                type: "EXECUTION_FINISHED",
                deviceName: data.deviceName,
                error: err.message
              }));
              aborted = true;
              break;
            }
          }

          if (!aborted) {
            ws.send(JSON.stringify({
              type: "EXECUTION_FINISHED",
              deviceName: data.deviceName,
              success: true
            }));
          }
        })();
      }

      if (data.type === "PLAN") {
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: "Not authenticated for this device"
          }));
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") return;

        try {
          const userApiKey = data.apiKey || null;

          const plan = await generatePlan(
            data.command,
            targetDevice.platform || "win32",
            userApiKey
          );

          ws.send(JSON.stringify({
            type: "PLAN_PREVIEW",
            deviceName: data.deviceName,
            steps: plan.steps
          }));
        } catch (err) {
          const errorMessage = err.message.includes("Ollama")
            ? "AI planning is not available. Please enter commands directly."
            : `AI planning error: ${err.message}`;

          ws.send(JSON.stringify({
            type: "PLAN_ERROR",
            deviceName: data.deviceName,
            error: errorMessage
          }));
        }
      }
    });

    ws.on("close", () => {
      dashboardClients.delete(ws);
      console.log("Dashboard disconnected");
    });

    // Send list of all devices (without sensitive info)
    broadcastDevicesToDashboard(ws);
    return;
  }

  // ===== AGENT CONNECTION =====
  if (!token) {
    console.log("No token provided");
    ws.close();
    return;
  }

  // Token format: device-hostname:password
  const tokenParts = token.split(':');

  if (tokenParts.length < 2) {
    console.log("Invalid token format - missing password");
    ws.close();
    return;
  }

  // First part is device token, rest is password (in case password contains ':')
  const deviceToken = tokenParts[0];
  const password = tokenParts.slice(1).join(':');

  if (!deviceToken || !password) {
    console.log("Invalid token format");
    ws.close();
    return;
  }

  const deviceId = deviceToken;
  const deviceName = deviceToken.replace('device-', '').toUpperCase();

  // Auto-register device or verify password
  if (!devices.has(deviceId)) {
    console.log(`Registering new device: ${deviceName}`);
    devices.set(deviceId, {
      deviceName,
      passwordHash: hashPassword(password),
      status: "offline",
      ws: null,
      lastSeen: null
    });
  } else {
    // Verify password
    const device = devices.get(deviceId);
    if (device.passwordHash !== hashPassword(password)) {
      console.log(`Invalid password for device: ${deviceName}`);
      ws.close();
      return;
    }
  }

  const device = devices.get(deviceId);
  device.ws = ws;
  device.status = "online";
  device.lastSeen = Date.now();

  console.log(`Device connected: ${deviceName}`);
  broadcastDevices();

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "HEARTBEAT") {
      device.lastSeen = Date.now();
    }

    if (data.type === "LOG") {
      // Send logs only to authenticated dashboards
      dashboardClients.forEach((client) => {
        if (client.authenticatedDevices.has(deviceId)) {
          client.send(JSON.stringify({
            type: "LOG",
            deviceName: device.deviceName,
            message: data.message,
          }));
        }
      });
    }

    if (data.type === "EXECUTE_RESULT") {
      const list = pendingResults.get(device.deviceName) || [];
      for (let i = 0; i < list.length; i++) {
        const entry = list[i];
        if (entry.command === data.command) {
          clearTimeout(entry.timer);
          try {
            entry.resolve(data);
          } catch (e) {
            entry.reject(e);
          }
          list.splice(i, 1);
          break;
        }
      }
      pendingResults.set(device.deviceName, list);
    }
  });

  ws.on("close", () => {
    device.status = "offline";
    console.log(`${device.deviceName} disconnected`);
    broadcastDevices();
  });
});

// ---------- Heartbeat Monitor ----------
setInterval(() => {
  const now = Date.now();

  devices.forEach((device) => {
    if (
      device.status === "online" &&
      device.lastSeen &&
      now - device.lastSeen > 15000
    ) {
      device.status = "offline";
      console.log(`${device.deviceName} marked offline`);
    }
  });
}, 5000);

// ---------- Terminal Command Interface (only in local development) ----------
if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Type: send <DeviceName> <command>");

  rl.on("line", (input) => {
    const [keyword, deviceName, ...cmdParts] = input.split(" ");
    const command = cmdParts.join(" ");

    if (keyword !== "send") {
      console.log("Invalid command. Use: send <DeviceName> <command>");
      return;
    }

    let targetDevice = null;

    devices.forEach((device) => {
      if (device.deviceName === deviceName && device.status === "online") {
        targetDevice = device;
      }
    });

    if (!targetDevice) {
      console.log("Device not found or offline.");
      return;
    }

    targetDevice.ws.send(
      JSON.stringify({
        type: "EXECUTE",
        command
      })
    );

    console.log(`Command sent to ${deviceName}`);
  });
} else {
  console.log("Running in production mode - terminal interface disabled");
}

async function generatePlan(userInput, platform, userApiKey = null) {
  const homeDir = os.homedir();
  const desktopPath = path.join(homeDir, "Desktop");

  const prompt = `
You are an expert Windows command-line assistant. Generate precise, executable Windows commands for the user's request.

System Information:
- Home Directory: ${homeDir}
- Desktop Path: ${desktopPath}
- Platform: ${platform}

CRITICAL RULES:
1. Return ONLY valid JSON: {"steps": [{"command": "exact_command_here"}]}
2. Use ABSOLUTE paths with double backslashes (\\\\)
3. For file creation: echo content > full_path
4. For HTML/code files: escape special characters properly
5. Break complex tasks into simple, sequential steps
6. Test each command mentally before including it

COMMAND PATTERNS:

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

EXAMPLES:

Request: "create hello.html on desktop"
Response: {"steps": [{"command": "echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>Hello^</title^>^</head^>^<body^>^<h1^>Hello World^</h1^>^</body^>^</html^> > ${desktopPath}\\\\hello.html"}]}

Request: "create a folder called projects and a readme inside"
Response: {"steps": [{"command": "mkdir ${desktopPath}\\\\projects"}, {"command": "echo # Projects Folder > ${desktopPath}\\\\projects\\\\README.md"}]}

Request: "show me desktop files"
Response: {"steps": [{"command": "dir ${desktopPath}"}]}

Request: "open notepad"
Response: {"steps": [{"command": "start notepad"}]}

User Request: ${userInput}

Return ONLY JSON with executable commands:
`;

  // Priority: user-provided API key > server environment variable > Ollama fallback
  const GROQ_API_KEY = userApiKey || process.env.GROQ_API_KEY;

  if (GROQ_API_KEY) {
    // Use Groq API (free cloud option)
    console.log("Using Groq API for AI planning" + (userApiKey ? " (user-provided key)" : " (server key)"));

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const text = response.data.choices[0].message.content.trim();
      console.log("Groq AI output:", text);

      // Extract JSON safely
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI output");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Groq API error:", error.message);

      if (error.response?.status === 401) {
        throw new Error("Invalid API key. Please check your Groq API key in Settings.");
      }

      throw new Error("AI planning failed. Please check your Groq API key or use direct commands.");
    }
  } else {
    // Fallback to Ollama (local only)
    console.log("Using Ollama for AI planning (local only)");
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

    try {
      const response = await axios.post(
        `${ollamaUrl}/api/generate`,
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



// Helper to broadcast device list to a specific dashboard
function broadcastDevicesToDashboard(dashboardWs) {
  const deviceList = [];

  devices.forEach((device, deviceId) => {
    const isAuthenticated = dashboardWs.authenticatedDevices.has(deviceId);
    console.log(`Device ${deviceId}: authenticated=${isAuthenticated}`);

    deviceList.push({
      deviceName: device.deviceName,
      status: device.status,
      authenticated: isAuthenticated
    });
  });

  console.log('Broadcasting devices to dashboard:', deviceList);

  dashboardWs.send(JSON.stringify({
    type: "DEVICES",
    devices: deviceList,
  }));
}

function broadcastDevices() {
  dashboardClients.forEach((client) => {
    broadcastDevicesToDashboard(client);
  });
}
