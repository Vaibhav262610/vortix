const WebSocket = require("ws");
const { exec } = require("child_process");
const os = require("os");
const { login, getToken } = require("./auth");

const command = process.argv[2];

if (command === "login") {
  login();
  return;
}

if (command === "start") {
  startAgent();

  
  return;
}

console.log("Available commands:");
console.log("node agent.js login");
console.log("node agent.js start");

function startAgent() {
  const token = getToken();

  if (!token) {
    console.log("No token found. Run: node agent.js login");
    return;
  }

  const deviceName = os.hostname();
  const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

  ws.on("open", () => {
  console.log("Authenticated and connected to backend");

  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log("Sending heartbeat...");
        ws.send(
            JSON.stringify({
            type: "HEARTBEAT"
            })
        );
        }
    }, 5000);
    });


  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "EXECUTE") {
      executeCommand(data.command, ws, deviceName);
    }
  });

  ws.on("close", () => {
    console.log("Disconnected from backend");
  });
}

function executeCommand(command, ws, deviceName) {
  console.log(`Executing: ${command}`);

  const process = exec(command);

  process.stdout.on("data", (data) => {
    ws.send(
      JSON.stringify({
        type: "LOG",
        deviceName,
        message: data.toString()
      })
    );
  });

  process.stderr.on("data", (data) => {
    ws.send(
      JSON.stringify({
        type: "LOG",
        deviceName,
        message: data.toString()
      })
    );
  });

  process.on("close", () => {
    ws.send(
      JSON.stringify({
        type: "LOG",
        deviceName,
        message: "Command execution finished"
      })
    );
  });

  dashboardClients.forEach((client) => {
  client.send(
    JSON.stringify({
      type: "EXECUTION_FINISHED",
      deviceName: device.deviceName
    })
  );
});

  
}
