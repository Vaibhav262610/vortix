const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const DEFAULT_FOLDERS = ['Downloads', 'Desktop', 'Documents', 'Videos', 'Pictures'];
const WINDOWS_SKIP = new Set(['$recycle.bin', 'system volume information', 'windows',
  'program files', 'program files (x86)', 'programdata', 'recovery']);

async function listDriveRoots() {
  if (process.platform !== 'win32') return ['/'];
  const candidates = Array.from({ length: 26 }, (_, index) => `${String.fromCharCode(65 + index)}:\\`);
  const found = await Promise.all(candidates.map(async root => {
    try { return (await fs.stat(root)).isDirectory() ? root : null; }
    catch { return null; }
  }));
  return found.filter(Boolean);
}

async function scanRoots(roots, { maxFiles, maxDirectories, durationMs, skipSystemFolders }) {
  const queue = roots.map(folderPath => ({ folderPath, rootPath: folderPath, groupPath: folderPath, isRoot: true }));
  let next = 0;
  const largestFiles = [];
  const folderSizes = new Map();
  const deadline = Date.now() + durationMs;
  let scannedFiles = 0;
  let scannedDirectories = 0;
  let skipped = 0;
  let truncated = false;

  while (next < queue.length) {
    if (scannedFiles >= maxFiles || scannedDirectories >= maxDirectories || Date.now() >= deadline) {
      truncated = true;
      break;
    }
    const { folderPath, rootPath, groupPath, isRoot } = queue[next++];
    let entries;
    try { entries = await fs.readdir(folderPath, { withFileTypes: true }); }
    catch { skipped++; continue; }
    scannedDirectories++;

    for (const entry of entries) {
      if (scannedFiles >= maxFiles || Date.now() >= deadline) { truncated = true; break; }
      if (entry.isSymbolicLink()) { skipped++; continue; }
      if (skipSystemFolders && entry.isDirectory() && isRoot && WINDOWS_SKIP.has(entry.name.toLowerCase())) {
        skipped++; continue;
      }
      const fullPath = path.join(folderPath, entry.name);
      if (entry.isDirectory()) {
        if (scannedDirectories + queue.length - next >= maxDirectories) { truncated = true; continue; }
        queue.push({ folderPath: fullPath, rootPath, groupPath: isRoot ? fullPath : groupPath, isRoot: false });
      } else if (entry.isFile()) {
        try {
          const { size } = await fs.stat(fullPath);
          scannedFiles++;
          folderSizes.set(rootPath, (folderSizes.get(rootPath) || 0) + size);
          if (groupPath !== rootPath) folderSizes.set(groupPath, (folderSizes.get(groupPath) || 0) + size);
          largestFiles.push({ name: entry.name, path: fullPath, bytes: size });
          largestFiles.sort((a, b) => b.bytes - a.bytes);
          if (largestFiles.length > 12) largestFiles.pop();
        } catch { skipped++; }
      }
    }
  }

  return { files: largestFiles,
    folders: [...folderSizes].map(([folderPath, bytes]) => ({ path: folderPath, bytes }))
      .sort((a, b) => b.bytes - a.bytes).slice(0, 8),
    scannedFiles, scannedDirectories, skipped, truncated,
  };
}

async function scanStorage({ home = os.homedir(), folders = DEFAULT_FOLDERS,
  scope = 'home', drive, driveRoots, maxFiles = 10000, maxDirectories = 1500, durationMs = 12000 } = {}) {
  if (!['home', 'drive', 'all-drives'].includes(scope)) throw new Error('Invalid scan scope.');
  const availableDrives = driveRoots || await listDriveRoots();
  if (scope !== 'home') {
    const roots = scope === 'drive'
      ? availableDrives.filter(root => root.toLowerCase() === String(drive || '').toLowerCase())
      : availableDrives;
    if (!roots.length) throw new Error('Selected drive is unavailable.');
    const results = await Promise.all(roots.map(root => scanRoots([root], {
      maxFiles: Math.min(maxFiles, 5000), maxDirectories: Math.min(maxDirectories, 700),
      durationMs, skipSystemFolders: process.platform === 'win32',
    })));
    return { files: results.flatMap(result => result.files).sort((a, b) => b.bytes - a.bytes).slice(0, 12),
      folders: results.flatMap(result => result.folders).sort((a, b) => b.bytes - a.bytes).slice(0, 8),
      scannedFiles: results.reduce((sum, result) => sum + result.scannedFiles, 0),
      scannedDirectories: results.reduce((sum, result) => sum + result.scannedDirectories, 0),
      skipped: results.reduce((sum, result) => sum + result.skipped, 0),
      truncated: results.some(result => result.truncated), drives: availableDrives };
  }
  const roots = [];
  for (const name of folders) {
    const folderPath = path.join(home, name);
    try { if ((await fs.stat(folderPath)).isDirectory()) roots.push(folderPath); }
    catch { /* Optional user folder. */ }
  }
  return { ...await scanRoots(roots, { maxFiles, maxDirectories, durationMs, skipSystemFolders: false }), drives: availableDrives };
}

module.exports = { scanStorage, listDriveRoots };
