const { test } = require('node:test');
const assert = require('node:assert/strict');
const { analyzeRescueSnapshot } = require('../lib/rescue-insights');

test('Rescue insights only compare complete scans of the same location', () => {
  const previous = { scope: 'home', truncated: false, folders: [{ path: 'Downloads', bytes: 200 * 1024 ** 2 }] };
  const latest = { scope: 'home', truncated: false, folders: [{ path: 'Downloads', bytes: 400 * 1024 ** 2 }] };
  assert.match(analyzeRescueSnapshot(latest, previous), /grew by about 200 MB/);
  assert.match(analyzeRescueSnapshot({ ...latest, truncated: true }, previous), /partial/);
  assert.match(analyzeRescueSnapshot({ ...latest, scope: 'all-drives' }, previous), /baseline/);
});
