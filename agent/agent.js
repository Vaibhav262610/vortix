const WebSocket = require("ws");
const { exec } = require("child_process");
const os = require("os");
const { login, getToken } = require("./auth");

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});


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
  const deviceName = os.hostname();
  const token = `device-${deviceName.toLowerCase()}`;

  console.log(`Connecting as device: ${deviceName}`);
  console.log(`Using token: ${token}`);
  
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


  // ws.on("message", (message) => {
  //   const data = JSON.parse(message);

  //   if (data.type === "EXECUTE") {
  //     executeCommand(data.command, ws, deviceName);
  //   }
  // });

  ws.on("close", () => {
    console.log("Disconnected from backend");
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

  function processQueue() {
    if (isRunning || commandQueue.length === 0) return;

    isRunning = true;
    let command = commandQueue.shift();

    console.log("Executing command:", command);

    // Update current working directory if this is a cd command
    const newCwd = extractDirectoryFromCommand(command);
    if (newCwd) {
      currentCwd = newCwd;
      ws.send(JSON.stringify({ type: "LOG", message: `📁 Directory changed to: ${currentCwd}` }));
      console.log("Directory state updated to:", currentCwd);
    }

    // report current cwd for diagnostics
    ws.send(JSON.stringify({ type: "LOG", message: `📍 Working from: ${currentCwd}` }));
    ws.send(JSON.stringify({ type: "LOG", message: `⚙️ Executing: ${command}` }));

    // Use cmd.exe with /c flag to properly execute Windows commands
    const process = exec(command, {
      cwd: currentCwd,
      shell: "cmd.exe",
      maxBuffer: 10 * 1024 * 1024,  // 10MB buffer for large outputs
      encoding: "utf8"
    });

    // Track if we've received any output
    let hasOutput = false;

    process.stdout.on("data", (data) => {
      hasOutput = true;
      ws.send(JSON.stringify({
        type: "LOG",
        message: data.toString()
      }));
    });

    process.stderr.on("data", (data) => {
      hasOutput = true;
      ws.send(JSON.stringify({
        type: "LOG",
        message: `[ERROR] ${data.toString()}`
      }));
    });

    process.on("error", (err) => {
      ws.send(JSON.stringify({
        type: "LOG",
        message: `[EXEC ERROR] ${err.message}`
      }));
    });

    process.on("close", (code) => {
      ws.send(JSON.stringify({
        type: "LOG",
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
 