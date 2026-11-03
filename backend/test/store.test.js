const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

test('file store keeps ownership and user-scoped history after reload', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'vortix-store-'));
  const file = path.join(directory, 'state.json');
  process.env.DATABASE_URL = '';
  process.env.VORTIX_DATA_FILE = file;
  const modulePath = require.resolve('../lib/store');
  try {
    let store = require(modulePath);
    await store.init();
    await store.registerDevice('device-lab-pc', 'LAB-PC', 'salt:hash');
    const pairHash = crypto.createHash('sha256').update('pair-code').digest('hex');
    await store.createPairing(pairHash, 'owner-a', Date.now() + 60000);
    assert.equal((await store.consumePairingAndRegister(pairHash, 'device-new-pc', 'NEW-PC', () => 'salt:hash')).ownerId, 'owner-a');
    assert.equal(await store.consumePairingAndRegister(pairHash, 'device-replay', 'REPLAY', () => 'salt:hash'), null);
    for (let attempt = 0; attempt < 5; attempt++) await store.recordAuthFailure('device:device-new-pc', 5);
    assert.equal(await store.authAttemptStatus('device:device-new-pc'), true);
    assert.equal(await store.claimDevice('device-lab-pc', 'owner-a'), true);
    assert.equal(await store.claimDevice('device-lab-pc', 'owner-b'), false);
    assert.equal(await store.setRescueEnabled('device-lab-pc', 'owner-b', true), false);
    assert.equal(await store.setRescueEnabled('device-lab-pc', 'owner-a', true), true);
    assert.deepEqual((await store.listDueRescueDevices()).map(item => item.deviceId), ['device-lab-pc']);
    await store.saveRescueSnapshot('device-lab-pc', 'owner-a', { scope: 'home', folders: [], files: [], truncated: false });
    assert.deepEqual(await store.listDueRescueDevices(), []);
    await store.saveCommand({ userId: 'owner-a', deviceId: 'device-lab-pc', deviceName: 'LAB-PC', command: 'echo ok', output: 'ok', exitCode: 0, status: 'success', duration: 20 });

    delete require.cache[modulePath];
    store = require(modulePath);
    await store.init();
    assert.equal((await store.getDevice('device-lab-pc')).ownerId, 'owner-a');
    assert.equal((await store.getRescueState('device-lab-pc', 'owner-a')).enabled, true);
    assert.equal(await store.getRescueState('device-lab-pc', 'owner-b'), null);
    assert.equal(await store.clearRescueSnapshots('device-lab-pc', 'owner-b'), false);
    assert.equal(await store.clearRescueSnapshots('device-lab-pc', 'owner-a'), true);
    assert.equal((await store.getRescueState('device-lab-pc', 'owner-a')).enabled, false);
    assert.equal((await store.getRescueState('device-lab-pc', 'owner-a')).latest, null);
    assert.equal((await store.getDevice('device-new-pc')).ownerId, 'owner-a');
    assert.equal(await store.authAttemptStatus('device:device-new-pc'), true);
    assert.equal((await store.getHistory('owner-a')).commands[0].output, 'ok');
    assert.deepEqual((await store.getHistory('owner-b')).commands, []);
    assert.equal((await store.getStats('owner-a')).successCommands, 1);
  } finally {
    delete require.cache[modulePath];
    if (fs.existsSync(file)) fs.unlinkSync(file);
    fs.rmdirSync(directory);
  }
});
