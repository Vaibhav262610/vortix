const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { scanStorage } = require('../storage-scan');

test('storage scan finds large files and folders without changing them', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'vortix-scan-'));
  const downloads = path.join(home, 'Downloads');
  const nested = path.join(downloads, 'archive');
  const desktop = path.join(home, 'Desktop');
  fs.mkdirSync(nested, { recursive: true });
  fs.mkdirSync(desktop);
  const smaller = path.join(downloads, 'smaller.bin');
  const larger = path.join(nested, 'larger.bin');
  const note = path.join(desktop, 'note.txt');
  fs.writeFileSync(smaller, Buffer.alloc(4096));
  fs.writeFileSync(larger, Buffer.alloc(8192));
  fs.writeFileSync(note, 'hello');
  try {
    const result = await scanStorage({ home, folders: ['Downloads', 'Desktop'] });
    assert.equal(result.scannedFiles, 3);
    assert.equal(result.truncated, false);
    assert.equal(result.files[0].path, larger);
    assert.equal(result.folders[0].path, downloads);
    assert.equal(result.folders.find(folder => folder.path === nested).bytes, 8192);
    assert.equal(fs.statSync(larger).size, 8192);
    assert.equal((await scanStorage({ home, folders: ['Downloads'], maxFiles: 1 })).truncated, true);
  } finally {
    fs.unlinkSync(smaller);
    fs.unlinkSync(larger);
    fs.unlinkSync(note);
    fs.rmdirSync(nested);
    fs.rmdirSync(downloads);
    fs.rmdirSync(desktop);
    fs.rmdirSync(home);
  }
});

test('all-drives scan includes files outside the home folder', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vortix-drive-'));
  const outside = path.join(root, 'work');
  fs.mkdirSync(outside);
  const file = path.join(outside, 'video.bin');
  fs.writeFileSync(file, Buffer.alloc(16384));
  try {
    const result = await scanStorage({ scope: 'all-drives', driveRoots: [root], maxFiles: 100 });
    assert.equal(result.files[0].path, file);
    assert.deepEqual(result.drives, [root]);
    assert.equal(result.truncated, false);
    const selected = await scanStorage({ scope: 'drive', drive: root, driveRoots: [root] });
    assert.equal(selected.files[0].path, file);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
