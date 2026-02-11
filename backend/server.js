const dashboardClients = new Set();


const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const readline = require("readline");
const OpenAI = require("openai");


const wss = new WebSocket.Server({ port: 8080 });

console.log("Backend running on ws://localhost:8080");

const devices = new Map();
// pendingResults holds awaiting resolvers for EXECUTE_RESULT from agents
const pendingResults = new Map(); // deviceName -> [{ command, resolve, reject, timer }]

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
    if (data.type === "APPROVE_PLAN") {
        const targetDevice = [...devices.values()].find(
          (d) =>
            d.deviceName === data.deviceName &&
            d.status === "online"
        );

        if (!targetDevice) {
          console.log("Target device not found or offline");
          dashboardClients.forEach((client) => {
            client.send(
              JSON.stringify({
                type: "EXECUTION_FINISHED",
                deviceName: data.deviceName,
                error: "Device not found or offline"
              })
            );
          });
          return;
        }

       console.log("APPROVE_PLAN received:", data.steps);

        // Notify all dashboard clients execution started
        dashboardClients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: "EXECUTION_STARTED",
              deviceName: data.deviceName
            })
          );
        });

        // Execute steps sequentially: wait for agent to report EXECUTE_RESULT for each step
        (async () => {
          let aborted = false;
          for (const step of data.steps) {
            // Send command EXACTLY as provided - don't modify it
            const commandToExecute = step.command || step;
            console.log("Sending EXECUTE to agent for:", commandToExecute);
            
            targetDevice.ws.send(
              JSON.stringify({
                type: "EXECUTE",
                command: commandToExecute
              })
            );

            try {
              const result = await waitForExecuteResult(targetDevice.deviceName, commandToExecute);
              console.log("Step result:", result);

              // send step log to dashboards
              dashboardClients.forEach((client) => {
                client.send(
                  JSON.stringify({
                    type: "LOG",
                    deviceName: targetDevice.deviceName,
                    message: `✓ Step completed: ${commandToExecute} (exit code: ${result.code})`
                  })
                );
              });

              // Continue even if code is not 0 - let user see the output
              // but notify about non-zero exit
              if (typeof result.code === 'number' && result.code !== 0) {
                console.log(`Step exited with code ${result.code}: ${commandToExecute}`);
              }
            } catch (err) {
              console.error("Step execution error:", err.message);
              dashboardClients.forEach((client) => {
                client.send(
                  JSON.stringify({
                    type: "LOG",
                    deviceName: targetDevice.deviceName,
                    message: `✗ Step failed: ${commandToExecute} - ${err.message}`
                  })
                );
              });
              dashboardClients.forEach((client) => {
                client.send(
                  JSON.stringify({
                    type: "EXECUTION_FINISHED",
                    deviceName: data.deviceName,
                    error: err.message
                  })
                );
              });
              aborted = true;
              break;
            }
          }

          if (!aborted) {
            dashboardClients.forEach((client) => {
              client.send(
                JSON.stringify({
                  type: "EXECUTION_FINISHED",
                  deviceName: data.deviceName,
                  success: true
                })
              );
            });
          }
        })();
    }

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
    console.log("Generated plan:", plan.steps);

  // SEND PLAN PREVIEW TO DASHBOARD - wait for approval
  ws.send(
    JSON.stringify({
      type: "PLAN_PREVIEW",
      deviceName: data.deviceName,
      steps: plan.steps
    })
  );

  console.log("AI Plan sent for approval:", plan);
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

    if (data.type === "EXECUTE_RESULT") {
      console.log(`EXECUTE_RESULT received from ${device.deviceName}:`, data);
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
    broadcastDevices(); // 🔥 notify dashboard
  });
});

// ---------- Device Registration ----------
function registerDevice(deviceName, token) {
  // If no token provided, use the hostname-based token for consistency
  if (!token) {
    token = `device-${deviceName.toLowerCase()}`;
  }

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
registerDevice("VAIBHAV-PC");

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
const os = require("os");


async function generatePlan(userInput, platform) {
  const homeDir = os.homedir();
  const desktopPath = require("path").join(homeDir, "Desktop");
  
  const prompt = `
You are an AI OS command planner. Generate EXACT Windows commands for the user's request.

System Information:
- Home Directory: ${homeDir}
- Desktop Path: ${desktopPath}
- Platform: Windows

CRITICAL RULES:
1. Return ONLY valid JSON in this format - nothing else
2. Use ABSOLUTE paths, NOT relative paths
3. Use echo command for file creation (NOT type, NOT powershell)
4. One command per step
5. Never create unnecessary directories before files
6. Format: echo "content" > full_path_to_file.txt

CORRECT Examples:
- "create hello.txt with html on desktop"
  Response: {"steps": [{"command": "echo <!DOCTYPE html><html><head><title>Hello</title></head><body><h1>Hello</h1></body></html> > ${desktopPath}\\hello.txt"}]}

- "create test file with hello world"  
  Response: {"steps": [{"command": "echo hello world > ${homeDir}\\Desktop\\test.txt"}]}

- "list desktop files"
  Response: {"steps": [{"command": "dir ${desktopPath}"}]}

User Request: ${userInput}

Return ONLY JSON:
`;

  const response = await axios.post(
    "http://localhost:11434/api/generate",
    {
      model: "qwen2.5:7b",
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
