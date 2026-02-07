const dashboardClients = new Set();


const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const readline = require("readline");

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

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "COMMAND") {
      const targetDevice = [...devices.values()].find(
        (d) =>
          d.deviceName === data.deviceName &&
          d.status === "online"
      );

      if (!targetDevice) {
        console.log("Target device not found or offline");
        return;
      }

      targetDevice.ws.send(
        JSON.stringify({
          type: "EXECUTE",
          command: data.command,
        })
      );

      console.log(
        `Dashboard sent command to ${data.deviceName}`
      );
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
