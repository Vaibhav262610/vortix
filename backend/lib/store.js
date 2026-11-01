const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
const dataFile = path.resolve(process.env.VORTIX_DATA_FILE || path.join(__dirname, '..', 'data', 'state.json'));
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
let state = { devices: {}, commands: [] };

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
    `);
    return;
  }
  if (fs.existsSync(dataFile)) {
    const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    state = { devices: parsed.devices || {}, commands: parsed.commands || [] };
  }
}

async function getDevice(id) {
  if (pool) {
    const result = await pool.query('SELECT * FROM vortix_devices WHERE id = $1', [id]);
    const row = result.rows[0];
    return row && { id: row.id, name: row.name, passwordHash: row.password_hash, ownerId: row.owner_id, platform: row.platform };
  }
  return state.devices[id] || null;
}

async function registerDevice(id, name, passwordHash) {
  if (pool) {
    await pool.query('INSERT INTO vortix_devices (id, name, password_hash) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', [id, name, passwordHash]);
    return getDevice(id);
  }
  if (!state.devices[id]) {
    state.devices[id] = { id, name, passwordHash, ownerId: null, platform: 'unknown' };
    persist();
  }
  return state.devices[id];
}

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

module.exports = { init, getDevice, registerDevice, claimDevice, updatePlatform, listDevices, saveCommand, getHistory, getStats, mode: pool ? 'postgres' : 'file' };
