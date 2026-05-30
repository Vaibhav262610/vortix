// This is an updated version of server.js with database integration
// Copy the relevant parts to your server.js or replace it entirely

require('dotenv').config();
const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const cors = require("cors");
const readline = require("readline");
const axios = require("axios");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

// Database imports
const {
    saveCommandHistory,
    updateDeviceStatus,
    upsertDevice,
    getDeviceByDeviceId,
    getUserByClerkId
} = require('./lib/db-helpers');

// Use environment PORT for cloud deployment, fallback to 8080 for local
const PORT = process.env.PORT || 8080;

const dashboardClients = new Set();
const devices = new Map(); // deviceId -> { deviceName, password, status, ws, lastSeen, platform, userId, dbId }
const pendingResults = new Map();
const screenShareSessions = new Map();

// Helper to hash passwords
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Create Express app for API routes
const app = express();
app.use(cors());
app.use(express.json());

// Import routers
const historyRouter = require('./routes/history');
const statsRouter = require('./routes/stats');

// API routes
app.use('/api/history', historyRouter);
app.use('/api/stats', statsRouter);

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        devices: devices.size,
        dashboards: dashboardClients.size,
        uptime: process.uptime()
    });
});

// Create HTTP server
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

server.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Database: ${process.env.DATABASE_URL ? '✅ Connected' : '⚠️  Not configured'}`);
});

function waitForExecuteResult(deviceName, command, timeoutMs = 120000) {
    return new Promise((resolve, reject) => {
        const list = pendingResults.get(deviceName) || [];
        const entry = { command, resolve, reject, timer: null };
        entry.timer = setTimeout(() => {
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

// WebSocket Handling
wss.on("connection", (ws, req) => {
    const url = new URL(req.url, "http://localhost");
    const token = url.searchParams.get("token");
    const clientType = url.searchParams.get("type");

    // DASHBOARD CONNECTION
    if (clientType === "dashboard") {
        ws.authenticatedDevices = new Set();
        ws.userId = null; // Will be set after Clerk authentication
        dashboardClients.add(ws);
        console.log("Dashboard connected");

        ws.on("message", async (message) => {
            const data = JSON.parse(message);

            // Dashboard authenticates with Clerk user ID
            if (data.type === "AUTH_USER") {
                try {
                    const user = await getUserByClerkId(data.clerkId);
                    if (user) {
                        ws.userId = user.id;
                        ws.send(JSON.stringify({
                            type: "USER_AUTH_SUCCESS",
                            userId: user.id
                        }));

                        // Send devices for this user
                        broadcastDevicesToDashboard(ws);
                    } else {
                        ws.send(JSON.stringify({
                            type: "USER_AUTH_ERROR",
                            error: "User not found"
                        }));
                    }
                } catch (error) {
                    console.error("Error authenticating user:", error);
                    ws.send(JSON.stringify({
                        type: "USER_AUTH_ERROR",
                        error: error.message
                    }));
                }
                return;
            }

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

                ws.authenticatedDevices.add(deviceId);
                ws.send(JSON.stringify({
                    type: "AUTH_SUCCESS",
                    deviceName
                }));

                broadcastDevicesToDashboard(ws);
                return;
            }

            // All other message handlers remain the same...
            // (FORCE_EXECUTE, APPROVE_PLAN, PLAN, etc.)
            // Copy from your existing server.js
        });

        ws.on("close", () => {
            dashboardClients.delete(ws);
            console.log("Dashboard disconnected");
        });

        broadcastDevicesToDashboard(ws);
        return;
    }

    // AGENT CONNECTION
    if (!token) {
        console.log("No token provided");
        ws.close();
        return;
    }

    const tokenParts = token.split(':');
    if (tokenParts.length < 2) {
        console.log("Invalid token format");
        ws.close();
        return;
    }

    const deviceToken = tokenParts[0];
    const password = tokenParts.slice(1).join(':');
    const deviceId = deviceToken;
    const deviceName = deviceToken.replace('device-', '').toUpperCase();

    // Auto-register or verify device
    if (!devices.has(deviceId)) {
        console.log(`Registering new device: ${deviceName}`);
        devices.set(deviceId, {
            deviceName,
            passwordHash: hashPassword(password),
            status: "offline",
            ws: null,
            lastSeen: null,
            platform: "unknown",
            userId: null, // Will be set when user claims device
            dbId: null // Database ID
        });
    } else {
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

    // Update device in database
    (async () => {
        try {
            if (device.userId) {
                const dbDevice = await upsertDevice(device.userId, {
                    deviceId,
                    deviceName,
                    passwordHash: device.passwordHash,
                    platform: device.platform,
                    status: "online"
                });
                device.dbId = dbDevice.id;
            }
        } catch (error) {
            console.error("Error updating device in database:", error);
        }
    })();

    console.log(`Device connected: ${deviceName}`);
    broadcastDevices();

    ws.on("message", async (message) => {
        const data = JSON.parse(message);

        if (data.type === "HEARTBEAT") {
            device.lastSeen = Date.now();
            if (data.platform) {
                device.platform = data.platform;
            }
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

            // Save to database
            try {
                if (device.userId && device.dbId) {
                    await saveCommandHistory({
                        userId: device.userId,
                        deviceId: device.dbId,
                        command: data.command,
                        output: data.output || '',
                        exitCode: data.code,
                        status: data.code === 0 ? 'success' : 'error',
                        duration: data.duration,
                    });
                    console.log(`✅ Saved command to history: ${data.command}`);
                }
            } catch (error) {
                console.error('❌ Error saving command history:', error);
            }
        }

        // Other message handlers (LOG, SCREEN_FRAME, etc.)
        // Copy from your existing server.js
    });

    ws.on("close", () => {
        device.status = "offline";
        console.log(`${device.deviceName} disconnected`);

        // Update in database
        if (device.dbId) {
            updateDeviceStatus(deviceId, "offline").catch(console.error);
        }

        broadcastDevices();
    });
});

// Heartbeat Monitor
setInterval(() => {
    const now = Date.now();
    devices.forEach((device) => {
        if (device.status === "online" && device.lastSeen && now - device.lastSeen > 15000) {
            device.status = "offline";
            console.log(`${device.deviceName} marked offline`);

            // Update in database
            if (device.dbId) {
                updateDeviceStatus(device.deviceId, "offline").catch(console.error);
            }
        }
    });
}, 5000);

function broadcastDevicesToDashboard(dashboardWs) {
    const deviceList = [];
    devices.forEach((device, deviceId) => {
        const isAuthenticated = dashboardWs.authenticatedDevices.has(deviceId);
        deviceList.push({
            deviceName: device.deviceName,
            status: device.status,
            authenticated: isAuthenticated,
            platform: device.platform
        });
    });

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

// Copy the rest of your server.js code here
// (generatePlan function, terminal interface, etc.)

console.log("✅ Server started with database integration");
console.log("📊 API endpoints:");
console.log("   - GET /api/history");
console.log("   - GET /api/stats");
console.log("   - GET /health");
