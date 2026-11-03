const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
const dataFile = path.resolve(process.env.VORTIX_DATA_FILE || path.join(__dirname, '..', 'data', 'state.json'));
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
let state = { devices: {}, commands: [], pairings: {}, authAttempts: {}, rescueSettings: {}, rescueSnapshots: {}, workflows: {} };
let authFailureWrites = 0;

function persist() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  const temporary = `${dataFile}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(state), { mode: 0o600 });
  fs.renameSync(temporary, dataFile);
}

async function init() {
  if (pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vortix_devices (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, password_hash TEXT NOT NULL,
        owner_id TEXT, platform TEXT NOT NULL DEFAULT 'unknown',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS vortix_devices_owner_idx ON vortix_devices(owner_id);
      CREATE TABLE IF NOT EXISTS vortix_commands (
        id BIGSERIAL PRIMARY KEY, owner_id TEXT NOT NULL, device_id TEXT NOT NULL,
        device_name TEXT NOT NULL, command TEXT NOT NULL, output TEXT,
        exit_code INTEGER, status TEXT NOT NULL, duration_ms INTEGER,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS vortix_commands_owner_time_idx
        ON vortix_commands(owner_id, executed_at DESC);
      CREATE TABLE IF NOT EXISTS vortix_pairings (
        code_hash TEXT PRIMARY KEY, owner_id TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS vortix_auth_attempts (
        key TEXT PRIMARY KEY, failures INTEGER NOT NULL,
        window_started TIMESTAMPTZ NOT NULL, locked_until TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS vortix_rescue_settings (
        device_id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, enabled BOOLEAN NOT NULL DEFAULT FALSE,
        last_scan_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS vortix_rescue_snapshots (
        id BIGSERIAL PRIMARY KEY, device_id TEXT NOT NULL, owner_id TEXT NOT NULL,
        captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), summary JSONB NOT NULL
      );
      CREATE INDEX IF NOT EXISTS vortix_rescue_snapshots_device_time_idx
        ON vortix_rescue_snapshots(device_id, captured_at DESC);
      CREATE TABLE IF NOT EXISTS vortix_workflows (
        id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, device_id TEXT NOT NULL,
        kind TEXT NOT NULL, status TEXT NOT NULL, payload JSONB NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS vortix_workflows_owner_time_idx
        ON vortix_workflows(owner_id, updated_at DESC);
    `);
    await pool.query(`UPDATE vortix_workflows SET status = CASE
      WHEN status = 'sending' THEN 'delivery_uncertain' ELSE 'interrupted' END, updated_at=NOW()
      WHERE status IN ('running','sending')`);
    await pool.query('DELETE FROM vortix_workflows WHERE expires_at < NOW()');
    return;
  }
  if (fs.existsSync(dataFile)) {
    const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    state = { devices: parsed.devices || {}, commands: parsed.commands || [],
      pairings: parsed.pairings || {}, authAttempts: parsed.authAttempts || {},
      rescueSettings: parsed.rescueSettings || {}, rescueSnapshots: parsed.rescueSnapshots || {},
      workflows: parsed.workflows || {} };
    for (const [id, workflow] of Object.entries(state.workflows)) {
      if (workflow.expiresAt < Date.now()) delete state.workflows[id];
      else if (workflow.status === 'running' || workflow.status === 'sending') {
        workflow.status = workflow.status === 'sending' ? 'delivery_uncertain' : 'interrupted';
      }
    }
    persist();
  }
}

async function createWorkflow({ id, ownerId, deviceId, kind, payload, expiresAt }) {
  if (pool) {
    await pruneExpiredWorkflows();
    await pool.query('INSERT INTO vortix_workflows (id,owner_id,device_id,kind,status,payload,expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, ownerId, deviceId, kind, 'preview', JSON.stringify(payload), new Date(expiresAt)]);
  } else {
    await pruneExpiredWorkflows();
    state.workflows[id] = { id, ownerId, deviceId, kind, status: 'preview', payload, expiresAt,
      updatedAt: Date.now() };
    persist();
  }
}

async function pruneExpiredWorkflows() {
  if (pool) {
    await pool.query('DELETE FROM vortix_workflows WHERE expires_at < NOW()');
    return;
  }
  let changed = false;
  for (const [id, workflow] of Object.entries(state.workflows)) {
    if (workflow.expiresAt < Date.now()) { delete state.workflows[id]; changed = true; }
  }
  if (changed) persist();
}

async function getWorkflow(id, ownerId) {
  if (pool) {
    const result = await pool.query(`SELECT id,device_id,kind,status,payload,expires_at FROM vortix_workflows
      WHERE id=$1 AND owner_id=$2 AND expires_at > NOW()`, [id, ownerId]);
    const row = result.rows[0];
    return row && { id: row.id, ownerId, deviceId: row.device_id, kind: row.kind,
      status: row.status, payload: row.payload, expiresAt: new Date(row.expires_at).getTime() };
  }
  const workflow = state.workflows[id];
  return workflow?.ownerId === ownerId && workflow.expiresAt > Date.now() ? workflow : null;
}

async function updateWorkflow(id, ownerId, status, expected) {
  if (pool) {
    const result = await pool.query(`UPDATE vortix_workflows SET status=$3,updated_at=NOW()
      WHERE id=$1 AND owner_id=$2 AND status=ANY($4::text[]) AND expires_at > NOW() RETURNING id`,
    [id, ownerId, status, expected]);
    return result.rowCount === 1;
  }
  const workflow = await getWorkflow(id, ownerId);
  if (!workflow || !expected.includes(workflow.status)) return false;
  workflow.status = status;
  workflow.updatedAt = Date.now();
  persist();
  return true;
}

async function latestRecoverableWorkflow(ownerId) {
  const statuses = ['preview', 'interrupted', 'delivery_uncertain'];
  if (pool) {
    const result = await pool.query(`SELECT id,device_id,kind,status,payload,expires_at FROM vortix_workflows
      WHERE owner_id=$1 AND status=ANY($2::text[]) AND expires_at > NOW()
      ORDER BY CASE WHEN status='delivery_uncertain' THEN 0 ELSE 1 END, updated_at DESC LIMIT 1`, [ownerId, statuses]);
    const row = result.rows[0];
    return row && { id: row.id, ownerId, deviceId: row.device_id, kind: row.kind,
      status: row.status, payload: row.payload, expiresAt: new Date(row.expires_at).getTime() };
  }
  return Object.values(state.workflows).filter(workflow => workflow.ownerId === ownerId &&
    workflow.expiresAt > Date.now() && statuses.includes(workflow.status))
    .sort((a, b) => Number(b.status === 'delivery_uncertain') - Number(a.status === 'delivery_uncertain') ||
      b.updatedAt - a.updatedAt)[0] || null;
}

async function getDevice(id) {
  if (pool) {
    const result = await pool.query('SELECT * FROM vortix_devices WHERE id = $1', [id]);
    const row = result.rows[0];
    return row && { id: row.id, name: row.name, passwordHash: row.password_hash, ownerId: row.owner_id, platform: row.platform };
  }
  return state.devices[id] || null;
}

async function registerDevice(id, name, passwordHash, ownerId = null) {
  if (pool) {
    await pool.query('INSERT INTO vortix_devices (id, name, password_hash, owner_id) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING', [id, name, passwordHash, ownerId]);
    return getDevice(id);
  }
  if (!state.devices[id]) {
    state.devices[id] = { id, name, passwordHash, ownerId, platform: 'unknown' };
    persist();
  }
  return state.devices[id];
}

async function createPairing(codeHash, ownerId, expiresAt) {
  if (pool) {
    await pool.query('DELETE FROM vortix_pairings WHERE expires_at < NOW()');
    await pool.query('INSERT INTO vortix_pairings (code_hash, owner_id, expires_at) VALUES ($1,$2,$3)',
      [codeHash, ownerId, new Date(expiresAt)]);
    return;
  }
  for (const [hash, item] of Object.entries(state.pairings)) {
    if (item.expiresAt < Date.now()) delete state.pairings[hash];
  }
  state.pairings[codeHash] = { ownerId, expiresAt };
  persist();
}

async function consumePairingAndRegister(codeHash, id, name, getPasswordHash) {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const pairing = await client.query('SELECT owner_id FROM vortix_pairings WHERE code_hash=$1 AND expires_at > NOW() FOR UPDATE', [codeHash]);
      if (!pairing.rowCount) { await client.query('ROLLBACK'); return null; }
      const passwordHash = getPasswordHash();
      const inserted = await client.query('INSERT INTO vortix_devices (id,name,password_hash,owner_id) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING id',
        [id, name, passwordHash, pairing.rows[0].owner_id]);
      if (!inserted.rowCount) { await client.query('ROLLBACK'); return null; }
      await client.query('DELETE FROM vortix_pairings WHERE code_hash=$1', [codeHash]);
      await client.query('COMMIT');
      return getDevice(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }
  const pairing = state.pairings[codeHash];
  if (!pairing || pairing.expiresAt < Date.now() || state.devices[id]) return null;
  const passwordHash = getPasswordHash();
  state.devices[id] = { id, name, passwordHash, ownerId: pairing.ownerId, platform: 'unknown' };
  delete state.pairings[codeHash];
  persist();
  return state.devices[id];
}

async function authAttemptStatus(key) {
  if (pool) {
    const result = await pool.query('SELECT locked_until FROM vortix_auth_attempts WHERE key=$1', [key]);
    return result.rows[0]?.locked_until && new Date(result.rows[0].locked_until).getTime() > Date.now();
  }
  return Boolean(state.authAttempts[key]?.lockedUntil > Date.now());
}

async function recordAuthFailure(key, limit, windowMs = 600000, lockMs = 300000) {
  if (pool) {
    if (++authFailureWrites % 100 === 0) {
      await pool.query("DELETE FROM vortix_auth_attempts WHERE window_started < NOW() - INTERVAL '1 day'");
    }
    const result = await pool.query(`INSERT INTO vortix_auth_attempts (key, failures, window_started, locked_until)
      VALUES ($1,1,NOW(),NULL) ON CONFLICT (key) DO UPDATE SET
      failures = CASE WHEN vortix_auth_attempts.window_started < NOW() - ($3::bigint * INTERVAL '1 millisecond') THEN 1 ELSE vortix_auth_attempts.failures + 1 END,
      window_started = CASE WHEN vortix_auth_attempts.window_started < NOW() - ($3::bigint * INTERVAL '1 millisecond') THEN NOW() ELSE vortix_auth_attempts.window_started END,
      locked_until = CASE WHEN vortix_auth_attempts.window_started < NOW() - ($3::bigint * INTERVAL '1 millisecond') THEN NULL
        WHEN vortix_auth_attempts.failures + 1 >= $2 THEN NOW() + ($4::bigint * INTERVAL '1 millisecond') ELSE vortix_auth_attempts.locked_until END
      RETURNING locked_until`, [key, limit, windowMs, lockMs]);
    return Boolean(result.rows[0]?.locked_until);
  }
  const now = Date.now();
  const prior = state.authAttempts[key];
  const attempt = !prior || now - prior.windowStarted > windowMs
    ? { failures: 1, windowStarted: now, lockedUntil: 0 }
    : { ...prior, failures: prior.failures + 1 };
  if (attempt.failures >= limit) attempt.lockedUntil = now + lockMs;
  state.authAttempts[key] = attempt;
  if (Object.keys(state.authAttempts).length > 5000) {
    for (const [oldKey, old] of Object.entries(state.authAttempts)) {
      if (now - old.windowStarted > 86400000) delete state.authAttempts[oldKey];
    }
  }
  persist();
  return attempt.lockedUntil > now;
}

async function clearAuthAttempt(key) {
  if (pool) await pool.query('DELETE FROM vortix_auth_attempts WHERE key=$1', [key]);
  else if (state.authAttempts[key]) { delete state.authAttempts[key]; persist(); }
}

async function getRescueState(deviceId, ownerId) {
  const device = await getDevice(deviceId);
  if (!device || device.ownerId !== ownerId) return null;
  if (pool) {
    const [setting, snapshots] = await Promise.all([
      pool.query('SELECT enabled,last_scan_at FROM vortix_rescue_settings WHERE device_id=$1 AND owner_id=$2', [deviceId, ownerId]),
      pool.query('SELECT summary,captured_at FROM vortix_rescue_snapshots WHERE device_id=$1 AND owner_id=$2 ORDER BY captured_at DESC,id DESC LIMIT 2', [deviceId, ownerId]),
    ]);
    return { enabled: setting.rows[0]?.enabled === true, lastScanAt: setting.rows[0]?.last_scan_at || null,
      latest: snapshots.rows[0]?.summary || null, previous: snapshots.rows[1]?.summary || null };
  }
  const setting = state.rescueSettings[deviceId];
  const snapshots = state.rescueSnapshots[deviceId] || [];
  return { enabled: setting?.enabled === true, lastScanAt: setting?.lastScanAt || null,
    latest: snapshots[0]?.summary || null, previous: snapshots[1]?.summary || null };
}

async function setRescueEnabled(deviceId, ownerId, enabled) {
  const device = await getDevice(deviceId);
  if (!device || device.ownerId !== ownerId) return false;
  if (pool) {
    await pool.query(`INSERT INTO vortix_rescue_settings (device_id,owner_id,enabled) VALUES ($1,$2,$3)
      ON CONFLICT (device_id) DO UPDATE SET owner_id=$2,enabled=$3`, [deviceId, ownerId, enabled]);
  } else {
    const previous = state.rescueSettings[deviceId] || {};
    state.rescueSettings[deviceId] = { ...previous, ownerId, enabled };
    persist();
  }
  return true;
}

async function listDueRescueDevices() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (pool) {
    const rows = await pool.query(`SELECT device_id,owner_id FROM vortix_rescue_settings
      WHERE enabled=TRUE AND (last_scan_at IS NULL OR last_scan_at < $1)`, [cutoff]);
    return rows.rows.map(row => ({ deviceId: row.device_id, ownerId: row.owner_id }));
  }
  return Object.entries(state.rescueSettings).filter(([, setting]) =>
    setting.enabled && (!setting.lastScanAt || new Date(setting.lastScanAt) < cutoff))
    .map(([deviceId, setting]) => ({ deviceId, ownerId: setting.ownerId }));
}

async function saveRescueSnapshot(deviceId, ownerId, summary) {
  const device = await getDevice(deviceId);
  if (!device || device.ownerId !== ownerId) return false;
  if (pool) {
    await pool.query('INSERT INTO vortix_rescue_snapshots (device_id,owner_id,summary) VALUES ($1,$2,$3)',
      [deviceId, ownerId, JSON.stringify(summary)]);
    await pool.query(`DELETE FROM vortix_rescue_snapshots WHERE device_id=$1 AND owner_id=$2 AND id NOT IN (
      SELECT id FROM vortix_rescue_snapshots WHERE device_id=$1 AND owner_id=$2
      ORDER BY captured_at DESC,id DESC LIMIT 20
    )`, [deviceId, ownerId]);
    await pool.query('UPDATE vortix_rescue_settings SET last_scan_at=NOW() WHERE device_id=$1 AND owner_id=$2', [deviceId, ownerId]);
  } else {
    const snapshots = state.rescueSnapshots[deviceId] || [];
    snapshots.unshift({ capturedAt: new Date().toISOString(), summary });
    state.rescueSnapshots[deviceId] = snapshots.slice(0, 20);
    state.rescueSettings[deviceId] = { ...state.rescueSettings[deviceId], ownerId,
      lastScanAt: new Date().toISOString() };
    persist();
  }
  return true;
}

async function clearRescueSnapshots(deviceId, ownerId) {
  const device = await getDevice(deviceId);
  if (!device || device.ownerId !== ownerId) return false;
  if (pool) {
    await pool.query('DELETE FROM vortix_rescue_snapshots WHERE device_id=$1 AND owner_id=$2', [deviceId, ownerId]);
    await pool.query('UPDATE vortix_rescue_settings SET last_scan_at=NULL,enabled=FALSE WHERE device_id=$1 AND owner_id=$2', [deviceId, ownerId]);
  } else {
    delete state.rescueSnapshots[deviceId];
    if (state.rescueSettings[deviceId]) {
      state.rescueSettings[deviceId].lastScanAt = null;
      state.rescueSettings[deviceId].enabled = false;
    }
    persist();
  }
  return true;
}

async function close() { if (pool) await pool.end(); }

async function claimDevice(id, userId) {
  if (pool) {
    const result = await pool.query(
      'UPDATE vortix_devices SET owner_id = $2 WHERE id = $1 AND (owner_id IS NULL OR owner_id = $2) RETURNING *',
      [id, userId]
    );
    return Boolean(result.rowCount);
  }
  const device = state.devices[id];
  if (!device || (device.ownerId && device.ownerId !== userId)) return false;
  device.ownerId = userId;
  persist();
  return true;
}

async function updatePlatform(id, platform) {
  if (pool) {
    await pool.query('UPDATE vortix_devices SET platform = $2 WHERE id = $1', [id, platform]);
  } else if (state.devices[id]) {
    state.devices[id].platform = platform;
    persist();
  }
}

async function listDevices(userId) {
  if (pool) {
    const result = await pool.query('SELECT id, name, platform FROM vortix_devices WHERE owner_id = $1 ORDER BY name', [userId]);
    return result.rows;
  }
  return Object.values(state.devices).filter(device => device.ownerId === userId)
    .map(device => ({ id: device.id, name: device.name, platform: device.platform }));
}

async function saveCommand({ userId, deviceId, deviceName, command, output, exitCode, status, duration }) {
  const safeOutput = typeof output === 'string' ? output.slice(0, 16000) : '';
  if (pool) {
    await pool.query(
      'INSERT INTO vortix_commands (owner_id, device_id, device_name, command, output, exit_code, status, duration_ms) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, deviceId, deviceName, command, safeOutput, exitCode ?? null, status, duration ?? null]
    );
    return;
  }
  state.commands.unshift({ id: String(Date.now()) + Math.random().toString(36).slice(2), userId, deviceId, deviceName, command, output: safeOutput, exitCode: exitCode ?? null, status, duration: duration ?? null, executedAt: new Date().toISOString() });
  state.commands = state.commands.slice(0, 2000);
  persist();
}

async function getHistory(userId, { deviceId, search, limit = 50, offset = 0 } = {}) {
  if (pool) {
    const values = [userId, deviceId || null, search || null, limit, offset];
    const where = 'owner_id = $1 AND ($2::text IS NULL OR device_id = $2) AND ($3::text IS NULL OR command ILIKE $3)';
    values[2] = search ? `%${search}%` : null;
    const [rows, count] = await Promise.all([
      pool.query(`SELECT id, device_id, device_name, command, output, exit_code, status, duration_ms, executed_at FROM vortix_commands WHERE ${where} ORDER BY executed_at DESC LIMIT $4 OFFSET $5`, values),
      pool.query(`SELECT COUNT(*) FROM vortix_commands WHERE ${where}`, values.slice(0, 3)),
    ]);
    return { commands: rows.rows.map(row => ({ id: String(row.id), deviceId: row.device_id, device: { deviceName: row.device_name }, command: row.command, output: row.output, exitCode: row.exit_code, status: row.status, duration: row.duration_ms, executedAt: row.executed_at })), total: Number(count.rows[0].count) };
  }
  const filtered = state.commands.filter(item => item.userId === userId && (!deviceId || item.deviceId === deviceId) && (!search || item.command.toLowerCase().includes(search.toLowerCase())));
  return { commands: filtered.slice(offset, offset + limit).map(item => ({ ...item, device: { deviceName: item.deviceName } })), total: filtered.length };
}

async function getStats(userId) {
  if (pool) {
    const result = await pool.query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = $2) AS success, COUNT(*) FILTER (WHERE status = $3) AS error FROM vortix_commands WHERE owner_id = $1', [userId, 'success', 'error']);
    const { total, success, error } = result.rows[0];
    return { totalCommands: Number(total), successCommands: Number(success), errorCommands: Number(error), successRate: Number(total) ? Number(success) / Number(total) * 100 : 0 };
  }
  const commands = state.commands.filter(item => item.userId === userId);
  const successCommands = commands.filter(item => item.status === 'success').length;
  const errorCommands = commands.filter(item => item.status === 'error').length;
  return { totalCommands: commands.length, successCommands, errorCommands, successRate: commands.length ? successCommands / commands.length * 100 : 0 };
}

module.exports = { init, getDevice, registerDevice, claimDevice, updatePlatform, listDevices,
  createPairing, consumePairingAndRegister, authAttemptStatus, recordAuthFailure, clearAuthAttempt,
  getRescueState, setRescueEnabled, listDueRescueDevices, saveRescueSnapshot, clearRescueSnapshots,
  createWorkflow, getWorkflow, updateWorkflow, latestRecoverableWorkflow, pruneExpiredWorkflows,
  saveCommand, getHistory, getStats, close, mode: pool ? 'postgres' : 'file' };
