const dashboardClients = new Set();


const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const readline = require("readline");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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"
});

const wss = new WebSocket.Server({ port: 8080 });

console.log("Backend running on ws://localhost:8080");

const devices = new Map();

// ---------- WebSocket Handling ----------
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");

  const token = url.searchParams.get("token");
  const clientType = url.searchParams.get("type");

  // ===== DASHBOARD CONNECTION =====
  if (clientType === "dashboard") {
  dashboardClients.add(ws);
  console.log("Dashboard connected");
  // Send initial device list to newly connected dashboard
  broadcastDevices();

  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    if (data.type === "FORCE_EXECUTE") {
  const targetDevice = [...devices.values()].find(
    (d) =>
      d.deviceName === data.deviceName &&
      d.status === "online"
  );

  if (!targetDevice) return;

  targetDevice.ws.send(
    JSON.stringify({
      type: "EXECUTE",
      command: data.command,
    })
  );

  console.log("Force executed dangerous command");
}

    // if (data.type === "COMMAND") {
    //   const targetDevice = [...devices.values()].find(
    //     (d) =>
    //       d.deviceName === data.deviceName &&
    //       d.status === "online"
    //   );

    //   if (!targetDevice) {
    //     console.log("Target device not found or offline");
    //     return;
    //   }
    //    if (isDangerousCommand(data.command)) {
    // ws.send(
    //     JSON.stringify({
    //     type: "APPROVAL_REQUIRED",
    //     deviceName: data.deviceName,
    //     command: data.command
    //     })
    // );

    // console.log("Dangerous command detected, approval required");
    // return;
    // }

    //   targetDevice.ws.send(
    //     JSON.stringify({
    //       type: "EXECUTE",
    //       command: data.command,
    //     })
    //   );

    //   console.log(
    //     `Dashboard sent command to ${data.deviceName}`
    //   );
    // }
    if (data.type === "PLAN") {
  const targetDevice = [...devices.values()].find(
    (d) =>
      d.deviceName === data.deviceName &&
      d.status === "online"
  );

  if (!targetDevice) {
    console.log("Device not found or offline");
    return;
  }

  try {
    const plan = await generatePlan(
      data.command,
      targetDevice.platform || "win32"
    );

    console.log("AI Plan:", plan);
    // Notify dashboard execution started
    dashboardClients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "EXECUTION_STARTED",
          deviceName: data.deviceName
        })
      );
    });

    for (const step of plan.steps) {
      targetDevice.ws.send(
        JSON.stringify({
          type: "EXECUTE",
          command: step.command
        })
      );
    }

    // Notify dashboard execution finished after all steps are sent
    dashboardClients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "EXECUTION_FINISHED",
          deviceName: data.deviceName
        })
      );
    });
  } catch (err) {
    console.error("AI planning error:", err.message);
    // Notify dashboard of error
    dashboardClients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "EXECUTION_FINISHED",
          deviceName: data.deviceName,
          error: err.message
        })
      );
    });
  }
}

  });

  ws.on("close", () => {
    dashboardClients.delete(ws);
    console.log("Dashboard disconnected");
  });

  return;
}


  // ===== AGENT CONNECTION =====
  if (!token || !devices.has(token)) {
    console.log("Unauthorized connection attempt");
    ws.close();
    return;
  }

  const device = devices.get(token);

  device.ws = ws;
  device.status = "online";
  device.lastSeen = Date.now();

  console.log(`Authenticated device: ${device.deviceName}`);

  broadcastDevices(); // 🔥 notify dashboard

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "HEARTBEAT") {
      device.lastSeen = Date.now();
      console.log(`Heartbeat received from ${device.deviceName}`);
    }

    if (data.type === "LOG") {
      console.log(`[${device.deviceName}] ${data.message}`);

      // 🔥 send logs to dashboard
      dashboardClients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "LOG",
            deviceName: device.deviceName,
            message: data.message,
          })
        );
      });
    }
  });

  ws.on("close", () => {
    device.status = "offline";
    console.log(`${device.deviceName} disconnected`);
    broadcastDevices(); // 🔥 notify dashboard
  });
});

// ---------- Device Registration ----------
function registerDevice(deviceName) {
  const token = uuidv4();

  devices.set(token, {
    deviceName,
    status: "offline",
    ws: null,
    lastSeen: null
  });

  console.log(`Registered device: ${deviceName}`);
  console.log(`Token: ${token}`);

  return token;
}

// Register one device manually for testing
registerDevice("Test-Device");

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

// ---------- Terminal Command Interface ----------
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

function isDangerousCommand(command) {
  const dangerousPatterns = [
    "rm -rf",
    "format",
    "shutdown",
    "del /f",
    "mkfs",
    "diskpart"
  ];

  return dangerousPatterns.some((pattern) =>
    command.toLowerCase().includes(pattern)
  );
}

// async function generatePlan(userInput, platform) {
//   const prompt = `
// You are an AI OS command planner.

// Convert the user request into structured JSON steps.

// Return ONLY valid JSON in this format:

// {
//   "steps": [
//     { "command": "..." }
//   ]
// }

// Rules:
// - If Windows, use Windows commands.
// - If Mac, use Mac commands.
// - No explanations.
// - No markdown.
// - Only JSON.

// User Request: ${userInput}
// Platform: ${platform}
// `;

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0
//   });

//   const text = response.choices[0].message.content;

//   return JSON.parse(text);
// }
const axios = require("axios");

async function generatePlan(userInput, platform) {
  const prompt = `
You are an AI OS command planner.

Convert the user request into structured JSON steps.

Return ONLY valid JSON in this format:

{
  "steps": [
    { "command": "..." }
  ]
}

Rules:
- If platform is win32, use Windows commands.
- If platform is darwin, use Mac commands.
- No explanation.
- No markdown.
- Only JSON.

User Request: ${userInput}
Platform: ${platform}
`;

  const response = await axios.post(
    "http://localhost:11434/api/generate",
    {
      model: "llama3.1",
      prompt: prompt,
      stream: false
    }
  );

  const text = response.data.response.trim();

console.log("LLM raw output:", text);

// Extract JSON safely
const jsonMatch = text.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
  throw new Error("No valid JSON found in LLM output");
}

return JSON.parse(jsonMatch[0]);

}



function broadcastDevices() {
  const deviceList = [];

  devices.forEach((device) => {
    deviceList.push({
      deviceName: device.deviceName,
      status: device.status,
    });
  });

  dashboardClients.forEach((client) => {
    client.send(
      JSON.stringify({
        type: "DEVICES",
        devices: deviceList,
      })
    );
  });
}
