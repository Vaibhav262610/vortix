const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

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
    assert.equal(await store.claimDevice('device-lab-pc', 'owner-a'), true);
    assert.equal(await store.claimDevice('device-lab-pc', 'owner-b'), false);
    await store.saveCommand({ userId: 'owner-a', deviceId: 'device-lab-pc', deviceName: 'LAB-PC', command: 'echo ok', output: 'ok', exitCode: 0, status: 'success', duration: 20 });

    delete require.cache[modulePath];
    store = require(modulePath);
    await store.init();
    assert.equal((await store.getDevice('device-lab-pc')).ownerId, 'owner-a');
    assert.equal((await store.getHistory('owner-a')).commands[0].output, 'ok');
    assert.deepEqual((await store.getHistory('owner-b')).commands, []);
    assert.equal((await store.getStats('owner-a')).successCommands, 1);
  } finally {
    delete require.cache[modulePath];
    if (fs.existsSync(file)) fs.unlinkSync(file);
    fs.rmdirSync(directory);
  }
});
