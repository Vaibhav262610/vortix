const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

test('PostgreSQL atomically consumes pairing and persists limits and Rescue settings',
  { skip: !process.env.VORTIX_TEST_DATABASE_URL }, async () => {
    const url = new URL(process.env.VORTIX_TEST_DATABASE_URL);
    if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/vortix_test') {
      throw new Error('Refusing to run store integration test against a non-local or non-test database');
    }
    process.env.DATABASE_URL = url.toString();
    const storePath = require.resolve('../lib/store');
    delete require.cache[storePath];
    const store = require(storePath);
    const suffix = crypto.randomUUID();
    const deviceId = `device-bench-${suffix}`;
    const codeHash = crypto.createHash('sha256').update(suffix).digest('hex');
    const key = `device:${deviceId}`;
    try {
      await store.init();
      await store.createPairing(codeHash, 'test-owner', Date.now() + 60000);
      const first = await store.consumePairingAndRegister(codeHash, deviceId, `BENCH-${suffix}`, () => 'salt:hash');
      assert.equal(first.ownerId, 'test-owner');
      assert.equal(await store.consumePairingAndRegister(codeHash, `device-replay-${suffix}`, 'REPLAY', () => 'salt:hash'), null);
      for (let i = 0; i < 5; i++) await store.recordAuthFailure(key, 5);
      assert.equal(await store.authAttemptStatus(key), true);
      await store.setRescueEnabled(deviceId, 'test-owner', true);
      assert.equal((await store.getRescueState(deviceId, 'test-owner')).enabled, true);
      await store.saveRescueSnapshot(deviceId, 'test-owner', { scope: 'home', folders: [], files: [], truncated: false });
      assert.equal((await store.getRescueState(deviceId, 'test-owner')).latest.scope, 'home');
      for (let i = 0; i < 21; i++) {
        await store.saveRescueSnapshot(deviceId, 'test-owner', { scope: 'home', sample: i });
      }
      assert.equal((await store.getRescueState(deviceId, 'test-owner')).latest.sample, 20);
      const { Pool } = require('pg');
      const verifyPool = new Pool({ connectionString: url.toString() });
      try {
        const retained = await verifyPool.query('SELECT COUNT(*) AS count FROM vortix_rescue_snapshots WHERE device_id=$1', [deviceId]);
        assert.equal(Number(retained.rows[0].count), 20);
      } finally { await verifyPool.end(); }
      await store.clearRescueSnapshots(deviceId, 'test-owner');
      assert.equal((await store.getRescueState(deviceId, 'test-owner')).latest, null);
      await store.createWorkflow({ id: suffix, ownerId: 'test-owner', deviceId, kind: 'discord',
        payload: { deviceName: `BENCH-${suffix}`, recipient: 'friend', message: 'hello' },
        expiresAt: Date.now() + 60000 });
      assert.equal(await store.updateWorkflow(suffix, 'test-owner', 'running', ['preview']), true);
      await store.init();
      assert.equal((await store.getWorkflow(suffix, 'test-owner')).status, 'interrupted');
      assert.equal(await store.updateWorkflow(suffix, 'other-owner', 'done', ['interrupted']), false);
    } finally {
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: url.toString() });
      try {
        await pool.query('DELETE FROM vortix_workflows WHERE id=$1', [suffix]);
        await pool.query('DELETE FROM vortix_rescue_snapshots WHERE device_id=$1', [deviceId]);
        await pool.query('DELETE FROM vortix_rescue_settings WHERE device_id=$1', [deviceId]);
        await pool.query('DELETE FROM vortix_auth_attempts WHERE key=$1', [key]);
        await pool.query('DELETE FROM vortix_pairings WHERE code_hash=$1', [codeHash]);
        await pool.query('DELETE FROM vortix_devices WHERE id=$1', [deviceId]);
      } finally { await pool.end(); await store.close(); delete require.cache[storePath]; }
    }
  });
