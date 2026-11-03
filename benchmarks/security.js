// Replays the same auth probes against a chosen baseline server and this working tree.
// Run: node benchmarks/security.js [git-ref]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const { spawn, execFileSync } = require('node:child_process');
const WebSocket = require('../backend/node_modules/ws');

const root = path.resolve(__dirname, '..');
const backend = path.join(root, 'backend');
const baselineRef = process.argv[2] || '048f7c0';
const baselineFile = path.join(backend, '.bench-baseline-server.js');

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
async function health(port) {
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  return response.json();
}
async function ready(port, child) {
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`Server exited: ${child.exitCode}`);
    try { return await health(port); } catch { await delay(100); }
  }
  throw new Error('Server did not become healthy');
}
async function agentAttempt(port, name, password) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/`, { headers: {
    Authorization: `Basic ${Buffer.from(`device-${name}:${password}`).toString('base64')}`,
  } });
  await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
  await Promise.race([
    new Promise(resolve => ws.once('close', resolve)),
    new Promise(resolve => ws.once('message', resolve)),
    delay(700),
  ]);
  // Authentication can finish after the WebSocket opens.
  await delay(150);
  const count = (await health(port)).devices;
  ws.terminate();
  return count;
}
async function run(label, serverFile) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'vortix-benchmark-'));
  const dataFile = path.join(temporary, 'state.json');
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = `${salt}:${crypto.scryptSync('correctpass', salt, 64).toString('hex')}`;
  fs.writeFileSync(dataFile, JSON.stringify({ devices: {
    'device-benchmark-pc': { id: 'device-benchmark-pc', name: 'BENCHMARK-PC', passwordHash,
      ownerId: 'benchmark-owner', platform: 'win32' },
  }, commands: [] }));
  const port = await freePort();
  const child = spawn(process.execPath, [serverFile], { cwd: backend, stdio: 'ignore', env: {
    ...process.env, DATABASE_URL: '', VORTIX_DATA_FILE: dataFile, PORT: String(port),
    CLERK_SECRET_KEY: 'sk_test_benchmark-only', CLERK_JWT_KEY: '', NODE_ENV: 'test',
  } });
  try {
    await ready(port, child);
    const unknownStart = performance.now();
    const unknownRegistered = (await agentAttempt(port, 'guessable-name', 'any-password')) > 0;
    const unknownMs = Math.round(performance.now() - unknownStart);
    for (let i = 0; i < 5; i++) await agentAttempt(port, 'benchmark-pc', `wrong-${i}`);
    const correctStart = performance.now();
    const correctAfterFiveFailures = (await agentAttempt(port, 'benchmark-pc', 'correctpass')) > (unknownRegistered ? 1 : 0);
    const correctMs = Math.round(performance.now() - correctStart);
    return { label, unknownRegistered, correctAfterFiveFailures, unknownMs, correctMs };
  } finally {
    child.kill();
    // Files are created under this exact temporary directory by this benchmark.
    if (path.dirname(dataFile) !== temporary || !temporary.startsWith(os.tmpdir())) throw new Error('Unexpected benchmark path');
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

(async () => {
  if (fs.existsSync(baselineFile)) throw new Error('Baseline scratch file already exists');
  const oldSource = execFileSync('git', ['show', `${baselineRef}:backend/server.js`], { cwd: root });
  fs.writeFileSync(baselineFile, oldSource);
  try {
    const before = await run('baseline', baselineFile);
    const after = await run('current', path.join(backend, 'server.js'));
    console.log(JSON.stringify({ baselineRef, before, after, note: 'Latency includes local process and filesystem variability; security outcomes are the comparison.' }, null, 2));
  } finally {
    if (path.dirname(baselineFile) === backend) fs.unlinkSync(baselineFile);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
