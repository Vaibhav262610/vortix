require('dotenv').config();
const WebSocket = require("ws");
const { verifyToken } = require('@clerk/backend');
const http = require("http");
const readline = require("readline");
const axios = require("axios");
const crypto = require("crypto");
const { selectGroqKey, generateGroqPlan } = require('./lib/groq-planning');
const { mayBeDiscordMessage, extractDiscordMessage, verifyDiscordScreen, waitForDiscordSearch } = require('./lib/discord-workflow');
const store = require('./lib/store');

if (!/^sk_(test|live)_/.test(process.env.CLERK_SECRET_KEY || '') && !process.env.CLERK_JWT_KEY) {
  throw new Error('Configure CLERK_SECRET_KEY (sk_test_ or sk_live_) or CLERK_JWT_KEY');
}

// Use environment PORT for cloud deployment, fallback to 8080 for local
const PORT = process.env.PORT || 8080;

const dashboardClients = new Set();
const devices = new Map(); // deviceId -> { deviceName, password, status, ws, lastSeen, platform }
const pendingResults = new Map();
const screenShareSessions = new Map(); // deviceName -> Set of dashboard websockets
const pendingAudits = new Map();
const pendingStorageScans = new Map();
const pendingDesktopActions = new Map();
const activeDiscordWorkflows = new Map();

function requestDesktopAction(device, action, value) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const timer = setTimeout(() => {
      pendingDesktopActions.delete(requestId);
      reject(new Error('Desktop action timed out. Check that the agent is running in your signed-in desktop session.'));
    }, 30000);
    pendingDesktopActions.set(requestId, { deviceId: `device-${device.deviceName.toLowerCase()}`, resolve, reject, timer });
    device.ws.send(JSON.stringify({ type: 'DISCORD_ACTION', requestId, action, value }));
  });
}

// Helper to hash passwords
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

async function verifySession(token) {
  const authorizedParties = process.env.CLERK_AUTHORIZED_PARTIES
    ?.split(',').map(origin => origin.trim()).filter(Boolean);
  return verifyToken(token, {
    ...(process.env.CLERK_SECRET_KEY ? { secretKey: process.env.CLERK_SECRET_KEY } : {}),
    ...(process.env.CLERK_JWT_KEY ? { jwtKey: process.env.CLERK_JWT_KEY.replace(/\\n/g, '\n') } : {}),
    ...(authorizedParties?.length ? { authorizedParties } : {}),
  });
}

// Create HTTP server for health checks and WebSocket upgrade
const server = http.createServer(async (req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      persistence: store.mode,
      devices: devices.size,
      dashboards: dashboardClients.size,
      uptime: process.uptime()
    }));
  } else if (req.method === 'GET' && (req.url?.startsWith('/api/history') || req.url?.startsWith('/api/stats'))) {
    try {
      const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
      if (!token) {
        res.writeHead(401); res.end('Unauthorized'); return;
      }
      const claims = await verifySession(token);
      const url = new URL(req.url, 'http://localhost');
      let payload;
      if (url.pathname === '/api/history') {
        const requestedLimit = Number(url.searchParams.get('limit'));
        const requestedOffset = Number(url.searchParams.get('offset'));
        const limit = Number.isSafeInteger(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 50;
        const offset = Number.isSafeInteger(requestedOffset) ? Math.max(0, requestedOffset) : 0;
        payload = await store.getHistory(claims.sub, {
          deviceId: url.searchParams.get('deviceId'),
          search: url.searchParams.get('search')?.slice(0, 100), limit, offset,
        });
      } else if (url.pathname === '/api/stats') {
        payload = await store.getStats(claims.sub);
      } else {
        res.writeHead(404); res.end('Not Found'); return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(payload));
    } catch (error) {
      const unauthorized = /token|jwt|session|authorized|expired/i.test(error.message);
      res.writeHead(unauthorized ? 401 : 500);
      res.end(unauthorized ? 'Unauthorized' : 'Server error');
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server, maxPayload: 16 * 1024 * 1024 });

store.init().then(() => server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} (${store.mode} persistence)`);
  if (process.env.NODE_ENV === 'production' && store.mode === 'file') {
    console.warn('File persistence is not durable on an ephemeral host. Configure DATABASE_URL for production.');
  }
})).catch(error => {
  console.error('Could not initialize persistence:', error);
  process.exit(1);
});

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

function trackCommand(userId, deviceId, deviceName, command) {
  const list = pendingAudits.get(deviceId) || [];
  const entry = { userId, deviceId, deviceName, command, startedAt: Date.now() };
  entry.timer = setTimeout(() => {
    const queue = pendingAudits.get(deviceId) || [];
    const index = queue.indexOf(entry);
    if (index >= 0) queue.splice(index, 1);
    store.saveCommand({ userId, deviceId, deviceName, command, status: 'error', output: 'Agent response timed out', duration: Date.now() - entry.startedAt }).catch(console.error);
  }, 120000);
  list.push(entry);
  pendingAudits.set(deviceId, list);
}

// ---------- WebSocket Handling ----------
wss.on("connection", async (ws, req) => {
  const url = new URL(req.url, "http://localhost");

  const basicAuth = req.headers.authorization?.match(/^Basic (.+)$/i)?.[1];
  const token = basicAuth ? Buffer.from(basicAuth, 'base64').toString('utf8') : url.searchParams.get("token");
  const clientType = url.searchParams.get("type");

  // ===== DASHBOARD CONNECTION =====
  if (clientType === "dashboard") {
    ws.authenticatedDevices = new Set(); // Track which devices this dashboard can access
    ws.pendingPlans = new Map();
    ws.pendingDiscord = null;
    ws.userId = null;
    let sessionExpiryTimer;

    ws.on("message", async (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch {
        ws.close(1008, 'Invalid message');
        return;
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        ws.close(1008, 'Invalid message');
        return;
      }

      // A dashboard must present a verified Clerk session before any device operation.
      // Refreshing the same user's session keeps device unlocks intact.
      if (data.type === 'AUTH_USER') {
        if (typeof data.token !== 'string') {
          ws.close(1008, 'Authentication required');
          return;
        }

        try {
          const claims = await verifySession(data.token);
          if (ws.readyState !== WebSocket.OPEN) return;
          if (ws.userId && ws.userId !== claims.sub) {
            ws.close(1008, 'Session user changed');
            return;
          }

          const firstAuthentication = !ws.userId;
          ws.userId = claims.sub;
          clearTimeout(sessionExpiryTimer);
          sessionExpiryTimer = setTimeout(() => ws.close(4001, 'Session expired'),
            Math.max(0, claims.exp * 1000 - Date.now()));
          if (firstAuthentication) {
            dashboardClients.add(ws);
            ws.send(JSON.stringify({ type: 'USER_AUTH_SUCCESS' }));
            await broadcastDevicesToDashboard(ws);
            console.log('Dashboard authenticated');
          } else {
            ws.send(JSON.stringify({ type: 'USER_AUTH_REFRESHED' }));
          }
        } catch (error) {
          console.warn('Dashboard authentication failed:', error.message);
          ws.close(1008, 'Invalid session');
        }
        return;
      }
      if (!ws.userId) {
        ws.close(1008, 'Authentication required');
        return;
      }
      if (data.type === 'DASHBOARD_HEARTBEAT') return;
      if (data.type !== 'AUTH_DEVICE' && data.type !== 'MULTI_DEVICE_EXECUTE' &&
          typeof data.deviceName !== 'string') {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Device name is required' }));
        return;
      }

      // Dashboard authenticates to view a specific device
      if (data.type === "AUTH_DEVICE") {
        const { deviceName, password } = data;
        if (typeof deviceName !== 'string' || typeof password !== 'string') {
          ws.send(JSON.stringify({ type: 'AUTH_ERROR', deviceName, error: 'Device name and password are required' }));
          return;
        }
        const deviceId = `device-${deviceName.toLowerCase()}`;
        let device;
        try { device = await store.getDevice(deviceId); }
        catch (error) {
          console.error('Could not load device:', error);
          ws.send(JSON.stringify({ type: 'AUTH_ERROR', deviceName, error: 'Device storage is unavailable' }));
          return;
        }

        if (!device) {
          ws.send(JSON.stringify({
            type: "AUTH_ERROR",
            deviceName,
            error: "Device not found"
          }));
          return;
        }

        if (!verifyPassword(password, device.passwordHash)) {
          ws.send(JSON.stringify({
            type: "AUTH_ERROR",
            deviceName,
            error: "Invalid password"
          }));
          return;
        }

        let claimed;
        try { claimed = await store.claimDevice(deviceId, ws.userId); }
        catch (error) {
          console.error('Could not claim device:', error);
          ws.send(JSON.stringify({ type: 'AUTH_ERROR', deviceName, error: 'Device storage is unavailable' }));
          return;
        }
        if (!claimed) {
          ws.send(JSON.stringify({ type: 'AUTH_ERROR', deviceName, error: 'This device belongs to another account' }));
          return;
        }

        const liveDevice = devices.get(deviceId);
        if (liveDevice) liveDevice.ownerId = ws.userId;

        // Authentication successful
        ws.authenticatedDevices.add(deviceId);
        ws.send(JSON.stringify({
          type: "AUTH_SUCCESS",
          deviceName: device.name
        }));

        // Send updated device list
        broadcastDevices();
        return;
      }

      if (data.type === "FORCE_EXECUTE") {
        if (typeof data.deviceName !== 'string' || typeof data.command !== 'string' || !data.command.trim()) return;
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: "Not authenticated for this device"
          }));
          return;
        }
        if (activeDiscordWorkflows.has(deviceId)) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'A desktop workflow is using this device. Finish or cancel it first.' }));
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") return;

        trackCommand(ws.userId, deviceId, targetDevice.deviceName, data.command);

        targetDevice.ws.send(
          JSON.stringify({
            type: "EXECUTE",
            command: data.command,
          })
        );
      }

      if (data.type === "APPROVE_PLAN") {
        if (typeof data.deviceName !== 'string' || typeof data.planId !== 'string') return;
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: "Not authenticated for this device"
          }));
          return;
        }
        if (activeDiscordWorkflows.has(deviceId)) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'A desktop workflow is using this device. Finish or cancel it first.' }));
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

        const pendingPlan = ws.pendingPlans.get(data.planId);
        if (!pendingPlan || pendingPlan.deviceId !== deviceId || pendingPlan.expiresAt < Date.now()) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Plan expired or invalid. Generate a new plan.' }));
          return;
        }
        ws.pendingPlans.delete(data.planId);

        // Notify dashboard execution started
        ws.send(JSON.stringify({
          type: "EXECUTION_STARTED",
          deviceName: data.deviceName
        }));

        // Execute steps sequentially
        (async () => {
          let aborted = false;
          for (const commandToExecute of pendingPlan.steps) {

            trackCommand(ws.userId, deviceId, targetDevice.deviceName, commandToExecute);
            const resultPromise = waitForExecuteResult(targetDevice.deviceName, commandToExecute);

            targetDevice.ws.send(
              JSON.stringify({
                type: "EXECUTE",
                command: commandToExecute
              })
            );

            try {
              const result = await resultPromise;
              if (typeof result.code === 'number' && result.code !== 0) {
                throw new Error(`Step exited with code ${result.code}`);
              }

              ws.send(JSON.stringify({
                type: "LOG",
                deviceName: targetDevice.deviceName,
                message: `✓ Step completed: ${commandToExecute} (exit code: ${result.code})`
              }));

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

      if (data.type === 'START_DISCORD_WORKFLOW') {
        const flow = ws.pendingDiscord;
        if (!flow || flow.id !== data.workflowId || flow.deviceName !== data.deviceName || flow.stage !== 'preview' || flow.expiresAt < Date.now()) {
          ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', error: 'Discord request expired. Enter it again.' }));
          return;
        }
        const device = devices.get(flow.deviceId);
        if (!ws.authenticatedDevices.has(flow.deviceId) || !device || device.status !== 'online' || !device.supportsDiscordDm) {
          ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', error: 'The device or Discord workflow is unavailable.' }));
          return;
        }
        if (activeDiscordWorkflows.has(flow.deviceId)) {
          ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', error: 'A desktop workflow is already running on this device.' }));
          return;
        }
        if (pendingAudits.get(flow.deviceId)?.length) {
          ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', error: 'A command is still running on this device. Try again when it finishes.' }));
          return;
        }
        activeDiscordWorkflows.set(flow.deviceId, flow);
        flow.stage = 'running';
        void (async () => {
          let frame;
          try {
            for (const [action, label] of [['find', 'Finding the recipient'], ['open', 'Opening the conversation'], ['draft', 'Preparing the message']]) {
              if (flow.cancelled) throw new Error('Workflow cancelled.');
              ws.send(JSON.stringify({ type: 'WORKFLOW_STATUS', deviceName: flow.deviceName, message: label }));
              frame = await requestDesktopAction(device, action,
                action === 'find' || action === 'open' ? flow.recipient : action === 'draft' ? flow.message : undefined);
              if (flow.cancelled) throw new Error('Workflow cancelled.');
              let check;
              if (action === 'find') {
                const search = await waitForDiscordSearch(frame, flow.recipient, flow.message, process.env.GROQ_API_KEY,
                  async () => {
                    if (flow.cancelled) throw new Error('Workflow cancelled.');
                    ws.send(JSON.stringify({ type: 'WORKFLOW_STATUS', deviceName: flow.deviceName,
                      message: 'Waiting for Discord search results' }));
                    return requestDesktopAction(device, 'observe');
                  });
                frame = search.frame;
                check = search.check;
              } else {
                check = await verifyDiscordScreen(action, flow.recipient, flow.message, frame, process.env.GROQ_API_KEY);
              }
              if (!check.ok) throw new Error(`${label} could not be verified: ${check.reason}`);
            }
            flow.stage = 'ready';
            flow.expiresAt = Date.now() + 2 * 60 * 1000;
            flow.readyTimer = setTimeout(() => {
              if (flow.stage !== 'ready') return;
              flow.stage = 'expired';
              activeDiscordWorkflows.delete(flow.deviceId);
              if (ws.pendingDiscord === flow) ws.pendingDiscord = null;
              if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', deviceName: flow.deviceName,
                error: 'The prepared message expired. Start again to get a fresh screen check.' }));
            }, 2 * 60 * 1000);
            ws.send(JSON.stringify({ type: 'WORKFLOW_READY', deviceName: flow.deviceName, workflowId: flow.id,
              recipient: flow.recipient, message: flow.message, frame }));
          } catch (error) {
            flow.stage = 'failed';
            activeDiscordWorkflows.delete(flow.deviceId);
            ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', deviceName: flow.deviceName, error: error.message, frame }));
          }
        })();
      }

      if (data.type === 'CONFIRM_DISCORD_SEND') {
        const flow = ws.pendingDiscord;
        if (!flow || flow.id !== data.workflowId || flow.deviceName !== data.deviceName || flow.stage !== 'ready' || flow.expiresAt < Date.now()) {
          ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', error: 'The prepared message expired. Start again.' }));
          return;
        }
        const device = devices.get(flow.deviceId);
        if (!ws.authenticatedDevices.has(flow.deviceId) || !device || device.status !== 'online') {
          ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', error: 'The device is offline. Start again when it reconnects.' }));
          return;
        }
        clearTimeout(flow.readyTimer);
        flow.stage = 'sending';
        void (async () => {
          let sendAttempted = false;
          try {
            ws.send(JSON.stringify({ type: 'WORKFLOW_STATUS', deviceName: flow.deviceName, message: 'Checking the draft again' }));
            const before = await requestDesktopAction(device, 'observe');
            const draftCheck = await verifyDiscordScreen('draft', flow.recipient, flow.message, before, process.env.GROQ_API_KEY);
            if (!draftCheck.ok) throw new Error(`The draft changed: ${draftCheck.reason}`);
            sendAttempted = true;
            await requestDesktopAction(device, 'send');
            flow.stage = 'sent';
            const after = await requestDesktopAction(device, 'observe');
            const sentCheck = await verifyDiscordScreen('send', flow.recipient, flow.message, after, process.env.GROQ_API_KEY);
            ws.send(JSON.stringify({ type: 'WORKFLOW_DONE', deviceName: flow.deviceName,
              message: sentCheck.ok ? `Message sent to ${flow.recipient}.` : `Send key pressed; delivery could not be verified: ${sentCheck.reason}` }));
          } catch (error) {
            ws.send(JSON.stringify({ type: 'WORKFLOW_ERROR', deviceName: flow.deviceName,
              error: sendAttempted ? `Send was attempted; delivery could not be verified: ${error.message}` : error.message }));
          } finally {
            activeDiscordWorkflows.delete(flow.deviceId);
            ws.pendingDiscord = null;
          }
        })();
      }

      if (data.type === 'CANCEL_DISCORD_WORKFLOW' && ws.pendingDiscord?.id === data.workflowId) {
        if (ws.pendingDiscord.stage === 'sending') return;
        ws.pendingDiscord.cancelled = true;
        clearTimeout(ws.pendingDiscord.readyTimer);
        if (ws.pendingDiscord.stage !== 'running' && ws.pendingDiscord.stage !== 'sending') {
          activeDiscordWorkflows.delete(ws.pendingDiscord.deviceId);
        }
        ws.pendingDiscord = null;
      }

      if (data.type === "PLAN") {
        if (typeof data.deviceName !== 'string' || typeof data.command !== 'string' || !data.command.trim()) return;
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          ws.send(JSON.stringify({
            type: "ERROR",
            message: "Not authenticated for this device"
          }));
          return;
        }
        if (activeDiscordWorkflows.has(deviceId)) {
          ws.send(JSON.stringify({ type: 'PLAN_ERROR', deviceName: data.deviceName,
            error: 'A desktop workflow is using this device. Finish or cancel it first.' }));
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") {
          ws.send(JSON.stringify({
            type: "PLAN_ERROR",
            deviceName: data.deviceName,
            error: "Device is offline. Reconnect it and try again."
          }));
          return;
        }

        try {
          if (mayBeDiscordMessage(data.command)) {
            if (!targetDevice.supportsDiscordDm) throw new Error('Discord messaging requires the updated Windows agent. See Setup to install it.');
            const extracted = await extractDiscordMessage(data.command, process.env.GROQ_API_KEY);
            const id = crypto.randomUUID();
            ws.pendingDiscord = { id, deviceId, deviceName: data.deviceName, ...extracted,
              stage: 'preview', expiresAt: Date.now() + 5 * 60 * 1000, cancelled: false };
            ws.send(JSON.stringify({ type: 'WORKFLOW_PREVIEW', deviceName: data.deviceName,
              workflowId: id, ...extracted }));
            return;
          }
          const plan = await generatePlan(
            data.command,
            targetDevice.platform && targetDevice.platform !== "unknown" ? targetDevice.platform : "win32",
            null
          );
          if (ws.readyState !== WebSocket.OPEN) return;

          const steps = Array.isArray(plan.steps) ? plan.steps.map(step => typeof step === 'string' ? step : step?.command)
            .filter(step => typeof step === 'string' && step.trim() && step.length <= 4096).slice(0, 12) : [];
          if (!steps.length) throw new Error('AI returned an empty or invalid plan');
          for (const [id, pending] of ws.pendingPlans) {
            if (pending.expiresAt < Date.now()) ws.pendingPlans.delete(id);
          }
          const planId = crypto.randomUUID();
          ws.pendingPlans.set(planId, { deviceId, steps, expiresAt: Date.now() + 5 * 60 * 1000 });

          ws.send(JSON.stringify({
            type: "PLAN_PREVIEW",
            deviceName: data.deviceName,
            planId,
            steps: steps.map(command => ({ command }))
          }));
        } catch (err) {
          ws.send(JSON.stringify({
            type: "PLAN_ERROR",
            deviceName: data.deviceName,
            error: err.message
          }));
        }
      }

      // Screen sharing
      if (data.type === "START_SCREEN_SHARE") {
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
            type: "ERROR",
            message: "Device not found or offline"
          }));
          return;
        }

        // Add this dashboard to screen share sessions
        if (!screenShareSessions.has(data.deviceName)) {
          screenShareSessions.set(data.deviceName, new Set());
        }
        screenShareSessions.get(data.deviceName).add(ws);

        // Request screen share from agent
        targetDevice.ws.send(JSON.stringify({
          type: "START_SCREEN_CAPTURE"
        }));
      }

      if (data.type === "STOP_SCREEN_SHARE") {
        const deviceId = `device-${data.deviceName.toLowerCase()}`;
        const targetDevice = devices.get(deviceId);

        // Remove this dashboard from screen share sessions
        if (screenShareSessions.has(data.deviceName)) {
          screenShareSessions.get(data.deviceName).delete(ws);

          // If no more dashboards watching, stop capture on agent
          if (screenShareSessions.get(data.deviceName).size === 0) {
            screenShareSessions.delete(data.deviceName);
            if (targetDevice && targetDevice.ws) {
              targetDevice.ws.send(JSON.stringify({
                type: "STOP_SCREEN_CAPTURE"
              }));
            }
          }
        }
      }

      // Auto-start control
      if (data.type === "ENABLE_AUTOSTART") {
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
            type: "ERROR",
            message: "Device not found or offline"
          }));
          return;
        }

        targetDevice.ws.send(JSON.stringify({
          type: "ENABLE_AUTOSTART"
        }));
      }

      if (data.type === "DISABLE_AUTOSTART") {
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
            type: "ERROR",
            message: "Device not found or offline"
          }));
          return;
        }

        targetDevice.ws.send(JSON.stringify({
          type: "DISABLE_AUTOSTART"
        }));
      }

      if (data.type === "GET_AUTOSTART_STATUS") {
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
            type: "ERROR",
            message: "Device not found or offline"
          }));
          return;
        }

        targetDevice.ws.send(JSON.stringify({
          type: "GET_AUTOSTART_STATUS"
        }));
      }

      // Multi-device execution
      if (data.type === "MULTI_DEVICE_EXECUTE") {
        const { deviceNames, command } = data;
        if (!Array.isArray(deviceNames) || typeof command !== 'string' || !command.trim()) return;

        deviceNames.forEach(deviceName => {
          const deviceId = `device-${deviceName.toLowerCase()}`;

          if (!ws.authenticatedDevices.has(deviceId)) {
            return;
          }

          const targetDevice = devices.get(deviceId);
          if (!targetDevice || targetDevice.status !== "online") {
            return;
          }

          trackCommand(ws.userId, deviceId, targetDevice.deviceName, command);

          // Send command to each device
          targetDevice.ws.send(JSON.stringify({
            type: "EXECUTE",
            command
          }));
        });
      }

      // System stats request
      if (data.type === "GET_SYSTEM_STATS") {
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          console.log("Backend: Device not authenticated:", deviceId);
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") {
          console.log("Backend: Device not found or offline:", deviceId);
          return;
        }

        targetDevice.ws.send(JSON.stringify({
          type: "GET_SYSTEM_STATS"
        }));
      }

      if (data.type === 'SCAN_STORAGE') {
        const deviceId = `device-${data.deviceName.toLowerCase()}`;
        if (!ws.authenticatedDevices.has(deviceId)) {
          ws.send(JSON.stringify({ type: 'STORAGE_SCAN_RESULT', deviceName: data.deviceName, error: 'Device access denied.' }));
          return;
        }
        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== 'online') {
          ws.send(JSON.stringify({ type: 'STORAGE_SCAN_RESULT', deviceName: data.deviceName, error: 'Device is offline.' }));
          return;
        }
        if (!targetDevice.supportsStorageScan) {
          ws.send(JSON.stringify({ type: 'STORAGE_SCAN_RESULT', deviceName: data.deviceName, error: 'This agent does not support storage scans. Update and restart it on the device.' }));
          return;
        }
        const scope = ['home', 'drive', 'all-drives'].includes(data.scope) ? data.scope : 'home';
        if (scope !== 'home' && !targetDevice.supportsDriveScan) {
          ws.send(JSON.stringify({ type: 'STORAGE_SCAN_RESULT', deviceName: data.deviceName,
            error: 'This agent can only scan your user folders. Update and restart it to scan other drives.' }));
          return;
        }
        if (scope === 'drive' && (typeof data.drive !== 'string' || !/^(?:[A-Z]:\\|\/)$/i.test(data.drive))) {
          ws.send(JSON.stringify({ type: 'STORAGE_SCAN_RESULT', deviceName: data.deviceName, error: 'Select a valid drive.' }));
          return;
        }
        const requestId = crypto.randomUUID();
        const timer = setTimeout(() => {
          pendingStorageScans.delete(requestId);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'STORAGE_SCAN_RESULT', deviceName: targetDevice.deviceName, error: 'Storage scan timed out. Update the device agent and try again.' }));
          }
        }, 20000);
        pendingStorageScans.set(requestId, { client: ws, deviceId, timer });
        targetDevice.ws.send(JSON.stringify({ type: 'SCAN_STORAGE', requestId, scope,
          drive: scope === 'drive' ? data.drive.toUpperCase() : undefined }));
      }

      // File transfer - Browse files
      if (data.type === "BROWSE_FILES") {
        console.log("Backend: Received BROWSE_FILES request for", data.deviceName, "path:", data.path);
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          console.log("Backend: Not authenticated for device:", data.deviceName);
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") {
          console.log("Backend: Device not found or offline:", data.deviceName);
          return;
        }

        console.log("Backend: Forwarding BROWSE_FILES to agent");
        targetDevice.ws.send(JSON.stringify({
          type: "BROWSE_FILES",
          path: data.path
        }));
      }

      // File transfer - Upload file
      if (data.type === "UPLOAD_FILE") {
        if (typeof data.deviceName !== 'string' || typeof data.fileName !== 'string' ||
            typeof data.fileData !== 'string' || data.fileData.length > 14 * 1024 * 1024 ||
            /[\\/]/.test(data.fileName)) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid upload or file exceeds 10 MB' }));
          return;
        }
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") {
          return;
        }

        targetDevice.ws.send(JSON.stringify({
          type: "UPLOAD_FILE",
          fileName: data.fileName,
          fileData: data.fileData,
          targetPath: data.targetPath
        }));
      }

      // File transfer - Download file
      if (data.type === "DOWNLOAD_FILE") {
        const deviceId = `device-${data.deviceName.toLowerCase()}`;

        if (!ws.authenticatedDevices.has(deviceId)) {
          return;
        }

        const targetDevice = devices.get(deviceId);
        if (!targetDevice || targetDevice.status !== "online") {
          return;
        }

        targetDevice.ws.send(JSON.stringify({
          type: "DOWNLOAD_FILE",
          filePath: data.filePath
        }));
      }
    });

    ws.on("close", () => {
      clearTimeout(sessionExpiryTimer);
      if (ws.pendingDiscord) {
        ws.pendingDiscord.cancelled = true;
        clearTimeout(ws.pendingDiscord.readyTimer);
        if (ws.pendingDiscord.stage !== 'running' && ws.pendingDiscord.stage !== 'sending') {
          activeDiscordWorkflows.delete(ws.pendingDiscord.deviceId);
        }
      }
      dashboardClients.delete(ws);
      for (const [requestId, pending] of pendingStorageScans) {
        if (pending.client === ws) {
          clearTimeout(pending.timer);
          pendingStorageScans.delete(requestId);
        }
      }

      // Clean up screen share sessions
      screenShareSessions.forEach((sessions, deviceName) => {
        if (sessions.has(ws)) {
          sessions.delete(ws);
          if (sessions.size === 0) {
            screenShareSessions.delete(deviceName);
            const deviceId = `device-${deviceName.toLowerCase()}`;
            const device = devices.get(deviceId);
            if (device && device.ws) {
              device.ws.send(JSON.stringify({
                type: "STOP_SCREEN_CAPTURE"
              }));
            }
          }
        }
      });

      console.log("Dashboard disconnected");
    });

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

  if (!/^device-[a-z0-9_.-]{1,80}$/i.test(deviceToken) || !password || password.length > 200) {
    console.log("Invalid token format");
    ws.close();
    return;
  }

  const deviceId = deviceToken;
  const deviceName = deviceToken.replace('device-', '').toUpperCase();

  let storedDevice;
  try {
    storedDevice = await store.getDevice(deviceId);
    if (!storedDevice) storedDevice = await store.registerDevice(deviceId, deviceName, hashPassword(password));
  } catch (error) {
    console.error('Device registration failed:', error);
    ws.close(1011, 'Device registration failed');
    return;
  }
  if (!verifyPassword(password, storedDevice.passwordHash)) {
    console.log(`Invalid password for device: ${deviceName}`);
    ws.close(1008, 'Invalid device password');
    return;
  }

  let device = devices.get(deviceId);
  if (!device) {
    device = { deviceName, passwordHash: storedDevice.passwordHash, ownerId: storedDevice.ownerId,
      status: 'offline', ws: null, lastSeen: null, platform: storedDevice.platform || 'unknown' };
    devices.set(deviceId, device);
  }
  if (device.ws && device.ws !== ws && device.ws.readyState === WebSocket.OPEN) {
    device.ws.close(1000, 'New agent connection');
  }
  device.ws = ws;
  device.status = "online";
  device.supportsStorageScan = false;
  device.lastSeen = Date.now();

  console.log(`Device connected: ${deviceName}`);
  broadcastDevices();

  ws.on("message", (message) => {
    let data;
    try { data = JSON.parse(message); } catch { ws.close(1008, 'Invalid message'); return; }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      ws.close(1008, 'Invalid message');
      return;
    }

    if (data.type === "HEARTBEAT") {
      device.lastSeen = Date.now();
      const supportsStorageScan = Array.isArray(data.capabilities) && data.capabilities.includes('storage-scan-v1');
      const supportsDriveScan = Array.isArray(data.capabilities) && data.capabilities.includes('storage-scan-v2');
      const supportsDiscordDm = Array.isArray(data.capabilities) && data.capabilities.includes('discord-dm-v1');
      if (device.supportsStorageScan !== supportsStorageScan || device.supportsDriveScan !== supportsDriveScan || device.supportsDiscordDm !== supportsDiscordDm) {
        device.supportsStorageScan = supportsStorageScan;
        device.supportsDriveScan = supportsDriveScan;
        device.supportsDiscordDm = supportsDiscordDm;
        broadcastDevices();
      }
      // Update platform info if provided
      if (data.platform) {
        device.platform = data.platform;
        store.updatePlatform(deviceId, data.platform).catch(console.error);
      }
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

    if (data.type === "SCREEN_FRAME") {
      // Broadcast screen frame to all dashboards watching this device
      if (screenShareSessions.has(device.deviceName)) {
        screenShareSessions.get(device.deviceName).forEach((dashboardWs) => {
          if (dashboardWs.readyState === WebSocket.OPEN) {
            dashboardWs.send(JSON.stringify({
              type: "SCREEN_FRAME",
              deviceName: device.deviceName,
              frame: data.frame
            }));
          }
        });
      }
    }

    if (data.type === "AUTOSTART_STATUS" || data.type === "AUTOSTART_ERROR") {
      // Forward auto-start status to authenticated dashboards
      dashboardClients.forEach((dashboardWs) => {
        const deviceId = `device-${device.deviceName.toLowerCase()}`;
        if (dashboardWs.authenticatedDevices.has(deviceId)) {
          dashboardWs.send(JSON.stringify({
            type: data.type,
            deviceName: device.deviceName,
            enabled: data.enabled,
            message: data.message
          }));
        }
      });
    }

    // Forward system stats to authenticated dashboards
    if (data.type === "SYSTEM_STATS") {
      dashboardClients.forEach((dashboardWs) => {
        const deviceId = `device-${device.deviceName.toLowerCase()}`;
        if (dashboardWs.authenticatedDevices.has(deviceId)) {
          dashboardWs.send(JSON.stringify({
            type: "SYSTEM_STATS",
            deviceName: device.deviceName,
            stats: data.stats
          }));
        }
      });
    }

    if (data.type === 'STORAGE_SCAN_RESULT' && typeof data.requestId === 'string') {
      const pending = pendingStorageScans.get(data.requestId);
      if (pending && pending.deviceId === deviceId) {
        clearTimeout(pending.timer);
        pendingStorageScans.delete(data.requestId);
        if (pending.client.readyState === WebSocket.OPEN && pending.client.authenticatedDevices.has(deviceId)) {
          const files = Array.isArray(data.files) ? data.files.slice(0, 12).filter(file =>
            typeof file?.name === 'string' && typeof file?.path === 'string' && Number.isFinite(file?.bytes))
            .map(file => ({ name: file.name.slice(0, 255), path: file.path.slice(0, 4096), bytes: file.bytes })) : [];
          const folders = Array.isArray(data.folders) ? data.folders.slice(0, 8).filter(folder =>
            typeof folder?.path === 'string' && Number.isFinite(folder?.bytes))
            .map(folder => ({ path: folder.path.slice(0, 4096), bytes: folder.bytes })) : [];
          pending.client.send(JSON.stringify({ type: 'STORAGE_SCAN_RESULT', deviceName: device.deviceName,
            files, folders, scannedFiles: data.scannedFiles || 0,
            scannedDirectories: data.scannedDirectories || 0, truncated: data.truncated === true,
            drives: Array.isArray(data.drives) ? data.drives.filter(drive => typeof drive === 'string' && /^[A-Z]:\\$|^\/$/i.test(drive)).slice(0, 26) : [],
            error: typeof data.error === 'string' ? data.error.slice(0, 300) : undefined }));
        }
      }
    }

    if (data.type === 'DISCORD_ACTION_RESULT' && typeof data.requestId === 'string') {
      const pending = pendingDesktopActions.get(data.requestId);
      if (pending && pending.deviceId === deviceId) {
        clearTimeout(pending.timer);
        pendingDesktopActions.delete(data.requestId);
        if (typeof data.error === 'string') pending.reject(new Error(data.error.slice(0, 300)));
        else if (typeof data.frame === 'string' && data.frame.length <= 11_200_000) pending.resolve(data.frame);
        else pending.reject(new Error('The agent returned an invalid screenshot.'));
      }
    }

    // Forward file list to authenticated dashboards
    if (data.type === "FILE_LIST") {
      console.log("Backend: Received FILE_LIST from agent", device.deviceName, "with", data.files?.length, "files");
      dashboardClients.forEach((dashboardWs) => {
        const deviceId = `device-${device.deviceName.toLowerCase()}`;
        if (dashboardWs.authenticatedDevices.has(deviceId)) {
          console.log("Backend: Forwarding FILE_LIST to dashboard for", device.deviceName);
          dashboardWs.send(JSON.stringify({
            type: "FILE_LIST",
            deviceName: device.deviceName,
            files: data.files,
            path: data.path
          }));
        }
      });
    }

    // Forward file download data to authenticated dashboards
    if (data.type === "FILE_DATA") {
      dashboardClients.forEach((dashboardWs) => {
        const deviceId = `device-${device.deviceName.toLowerCase()}`;
        if (dashboardWs.authenticatedDevices.has(deviceId)) {
          dashboardWs.send(JSON.stringify({
            type: "FILE_DATA",
            deviceName: device.deviceName,
            fileName: data.fileName,
            fileData: data.fileData
          }));
        }
      });
    }

    if (data.type === 'FILE_UPLOAD_RESULT') {
      dashboardClients.forEach(client => {
        if (client.authenticatedDevices.has(deviceId) && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'FILE_UPLOAD_RESULT', deviceName: device.deviceName,
            fileName: data.fileName, success: data.success === true, error: data.error }));
        }
      });
    }

    if (data.type === "EXECUTE_RESULT") {
      const auditQueue = pendingAudits.get(deviceId) || [];
      const auditIndex = auditQueue.findIndex(entry => entry.command === data.command);
      if (auditIndex >= 0) {
        const [entry] = auditQueue.splice(auditIndex, 1);
        clearTimeout(entry.timer);
        store.saveCommand({ userId: entry.userId, deviceId, deviceName: device.deviceName,
          command: entry.command, output: data.output || data.error || '', exitCode: data.code,
          status: data.code === 0 ? 'success' : 'error', duration: Date.now() - entry.startedAt })
          .then(() => dashboardClients.forEach(client => {
            if (client.userId === entry.userId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'COMMAND_RESULT', deviceName: device.deviceName, command: entry.command, code: data.code }));
            }
          })).catch(console.error);
      }
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
    if (device.ws !== ws) return;
    device.status = "offline";
    for (const [requestId, pending] of pendingDesktopActions) {
      if (pending.deviceId === deviceId) {
        clearTimeout(pending.timer);
        pendingDesktopActions.delete(requestId);
        pending.reject(new Error('Device disconnected during the desktop workflow.'));
      }
    }
    for (const [requestId, pending] of pendingStorageScans) {
      if (pending.deviceId === deviceId) {
        clearTimeout(pending.timer);
        pendingStorageScans.delete(requestId);
        if (pending.client.readyState === WebSocket.OPEN) {
          pending.client.send(JSON.stringify({ type: 'STORAGE_SCAN_RESULT', deviceName: device.deviceName, error: 'Device disconnected during the scan.' }));
        }
      }
    }
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



// Helper to broadcast device list to a specific dashboard
async function broadcastDevicesToDashboard(dashboardWs) {
  if (!dashboardWs.userId || dashboardWs.readyState !== WebSocket.OPEN) return;
  try {
    const owned = await store.listDevices(dashboardWs.userId);
    const deviceList = owned.map(record => {
      // A verified account owns this device; a new socket does not need its password again.
      dashboardWs.authenticatedDevices.add(record.id);
      const live = devices.get(record.id);
      return {
        deviceName: record.name,
        status: live?.status === 'online' ? 'online' : 'offline',
        authenticated: dashboardWs.authenticatedDevices.has(record.id),
        supportsStorageScan: live?.supportsStorageScan === true,
        supportsDriveScan: live?.supportsDriveScan === true,
        supportsDiscordDm: live?.supportsDiscordDm === true,
        platform: live?.platform || record.platform,
      };
    });
    if (dashboardWs.readyState === WebSocket.OPEN) {
      dashboardWs.send(JSON.stringify({ type: 'DEVICES', devices: deviceList }));
    }
  } catch (error) {
    console.error('Could not load devices:', error);
  }
}

function broadcastDevices() {
  dashboardClients.forEach((client) => {
    void broadcastDevicesToDashboard(client);
  });
}
