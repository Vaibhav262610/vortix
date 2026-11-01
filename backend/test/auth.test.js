const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const crypto = require('node:crypto');
const { once } = require('node:events');
const os = require('node:os');
const path = require('node:path');
const WebSocket = require('ws');

function testStoreEnv() {
  return { DATABASE_URL: '', VORTIX_DATA_FILE: path.join(os.tmpdir(), `vortix-test-${crypto.randomUUID()}.json`) };
}

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function waitForHealth(port, child) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Backend exited with code ${child.exitCode}`);
    try {
      await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/health`, response => {
          response.resume();
          response.on('end', resolve);
        }).on('error', reject);
      });
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  throw new Error('Backend did not start');
}

function rejectedDashboard(port, message) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/?type=dashboard`);
    const received = [];
    const timeout = setTimeout(() => {
      ws.terminate();
      reject(new Error('Dashboard connection was not rejected'));
    }, 5000);
    ws.on('open', () => ws.send(JSON.stringify(message)));
    ws.on('message', data => received.push(JSON.parse(data.toString())));
    ws.on('error', reject);
    ws.on('close', code => {
      clearTimeout(timeout);
      resolve({ code, received });
    });
  });
}

function waitForMessage(ws, type) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.off('message', onMessage);
      reject(new Error(`Timed out waiting for ${type}`));
    }, 5000);
    function onMessage(raw) {
      const message = JSON.parse(raw.toString());
      if (message.type !== type) return;
      clearTimeout(timeout);
      ws.off('message', onMessage);
      resolve(message);
    }
    ws.on('message', onMessage);
  });
}

function signedToken(privateKey, subject, expiresInSeconds = 60) {
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const input = `${encode({ alg: 'RS256', typ: 'JWT', kid: 'test' })}.${encode({
    iss: 'https://test.clerk.accounts.dev', sub: subject, sid: 'sess_test',
    azp: 'http://localhost:3000', iat: now, nbf: now, exp: now + expiresInSeconds,
  })}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url');
  return `${input}.${signature}`;
}

test('publishable key cannot be used as backend secret key', () => {
  const result = spawnSync(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, CLERK_SECRET_KEY: 'pk_test_wrong', CLERK_JWT_KEY: '' },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Configure CLERK_SECRET_KEY/);
});

test('dashboard WebSocket rejects commands and invalid Clerk sessions', { timeout: 15000 }, async () => {
  const port = await freePort();
  const child = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, ...testStoreEnv(), PORT: String(port), CLERK_SECRET_KEY: 'sk_test_test-only' },
    stdio: 'ignore',
  });

  try {
    await waitForHealth(port, child);

    const command = await rejectedDashboard(port, {
      type: 'FORCE_EXECUTE', deviceName: 'TEST', command: 'echo should-not-run',
    });
    assert.equal(command.code, 1008);
    assert.deepEqual(command.received, []);

    const invalidToken = await rejectedDashboard(port, {
      type: 'AUTH_USER', token: 'not-a-clerk-jwt',
    });
    assert.equal(invalidToken.code, 1008);
    assert.deepEqual(invalidToken.received, []);
  } finally {
    child.kill();
  }
});

test('verified session unlocks a device and refresh keeps access', { timeout: 15000 }, async () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const port = await freePort();
  const child = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: {
      ...process.env,
      ...testStoreEnv(),
      PORT: String(port),
      CLERK_SECRET_KEY: '',
      CLERK_JWT_KEY: publicKey.export({ type: 'spki', format: 'pem' }),
      CLERK_AUTHORIZED_PARTIES: 'http://localhost:3000',
    },
    stdio: 'ignore',
  });
  let agent;
  let dashboard;
  let returningDashboard;

  try {
    await waitForHealth(port, child);
    agent = new WebSocket(`ws://127.0.0.1:${port}/`, { headers: { Authorization: `Basic ${Buffer.from('device-test:password').toString('base64')}` } });
    await once(agent, 'open');
    dashboard = new WebSocket(`ws://127.0.0.1:${port}/?type=dashboard`);
    await once(dashboard, 'open');

    const authenticated = waitForMessage(dashboard, 'USER_AUTH_SUCCESS');
    const devices = waitForMessage(dashboard, 'DEVICES');
    dashboard.send(JSON.stringify({ type: 'AUTH_USER', token: signedToken(privateKey, 'user_test') }));
    await authenticated;
    assert.deepEqual((await devices).devices, []);

    const unlocked = waitForMessage(dashboard, 'AUTH_SUCCESS');
    dashboard.send(JSON.stringify({ type: 'AUTH_DEVICE', deviceName: 'TEST', password: 'password' }));
    await unlocked;

    const secondDashboard = new WebSocket(`ws://127.0.0.1:${port}/?type=dashboard`);
    await once(secondDashboard, 'open');
    const secondDevices = waitForMessage(secondDashboard, 'DEVICES');
    secondDashboard.send(JSON.stringify({ type: 'AUTH_USER', token: signedToken(privateKey, 'user_other') }));
    assert.deepEqual((await secondDevices).devices, []);
    const denied = waitForMessage(secondDashboard, 'AUTH_ERROR');
    secondDashboard.send(JSON.stringify({ type: 'AUTH_DEVICE', deviceName: 'TEST', password: 'password' }));
    assert.match((await denied).error, /another account/);
    secondDashboard.terminate();

    returningDashboard = new WebSocket(`ws://127.0.0.1:${port}/?type=dashboard`);
    await once(returningDashboard, 'open');
    const returningDevices = waitForMessage(returningDashboard, 'DEVICES');
    returningDashboard.send(JSON.stringify({ type: 'AUTH_USER', token: signedToken(privateKey, 'user_test') }));
    assert.deepEqual((await returningDevices).devices.map(device => [device.deviceName, device.authenticated]), [['TEST', true]]);

    const unexpectedErrors = [];
    returningDashboard.on('message', raw => {
      const message = JSON.parse(raw.toString());
      if (message.type === 'ERROR') unexpectedErrors.push(message.message);
    });
    returningDashboard.send(JSON.stringify({ type: 'DASHBOARD_HEARTBEAT' }));
    const resumedCommand = waitForMessage(agent, 'EXECUTE');
    returningDashboard.send(JSON.stringify({ type: 'FORCE_EXECUTE', deviceName: 'TEST', command: 'echo resumed' }));
    assert.equal((await resumedCommand).command, 'echo resumed');
    const resumedResult = waitForMessage(returningDashboard, 'COMMAND_RESULT');
    agent.send(JSON.stringify({ type: 'EXECUTE_RESULT', command: 'echo resumed', code: 0, output: 'resumed' }));
    await resumedResult;
    assert.deepEqual(unexpectedErrors, []);
    returningDashboard.terminate();

    const refreshed = waitForMessage(dashboard, 'USER_AUTH_REFRESHED');
    dashboard.send(JSON.stringify({ type: 'AUTH_USER', token: signedToken(privateKey, 'user_test', 120) }));
    await refreshed;

    const invalidPlan = waitForMessage(dashboard, 'ERROR');
    dashboard.send(JSON.stringify({ type: 'APPROVE_PLAN', deviceName: 'TEST', planId: 'made-up', steps: [{ command: 'echo unsafe' }] }));
    assert.match((await invalidPlan).message, /invalid/);

    const missingDevice = waitForMessage(dashboard, 'ERROR');
    dashboard.send(JSON.stringify({ type: 'BROWSE_FILES' }));
    assert.match((await missingDevice).message, /Device name/);

    const command = waitForMessage(agent, 'EXECUTE');
    dashboard.send(JSON.stringify({ type: 'FORCE_EXECUTE', deviceName: 'TEST', command: 'echo ok' }));
    assert.equal((await command).command, 'echo ok');

    const result = waitForMessage(dashboard, 'COMMAND_RESULT');
    agent.send(JSON.stringify({ type: 'EXECUTE_RESULT', command: 'echo ok', code: 0, output: 'ok' }));
    await result;
    const noToken = await fetch(`http://127.0.0.1:${port}/api/history`);
    assert.equal(noToken.status, 401);
    const ownHistory = await fetch(`http://127.0.0.1:${port}/api/history`, { headers: { Authorization: `Bearer ${signedToken(privateKey, 'user_test')}` } });
    assert.equal(ownHistory.status, 200);
    assert.equal((await ownHistory.json()).commands[0].output, 'ok');
    const otherHistory = await fetch(`http://127.0.0.1:${port}/api/history`, { headers: { Authorization: `Bearer ${signedToken(privateKey, 'user_other')}` } });
    assert.deepEqual((await otherHistory.json()).commands, []);

    const malformedClose = once(dashboard, 'close');
    dashboard.send('null');
    assert.equal((await malformedClose)[0], 1008);
    const health = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(health.status, 200);
  } finally {
    returningDashboard?.terminate();
    dashboard?.terminate();
    agent?.terminate();
    child.kill();
  }
});
