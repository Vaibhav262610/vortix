const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const DEFAULT_FOLDERS = ['Downloads', 'Desktop', 'Documents', 'Videos', 'Pictures'];

async function scanStorage({ home = os.homedir(), folders = DEFAULT_FOLDERS,
  maxFiles = 10000, maxDirectories = 1500, durationMs = 12000 } = {}) {
  const queue = [];
  for (const name of folders) {
    const folderPath = path.join(home, name);
    try {
      if ((await fs.stat(folderPath)).isDirectory()) queue.push({ folderPath, rootPath: folderPath, groupPath: folderPath, isRoot: true });
    } catch { /* An optional user folder may not exist. */ }
  }

  const largestFiles = [];
  const folderSizes = new Map();
  const deadline = Date.now() + durationMs;
  let scannedFiles = 0;
  let scannedDirectories = 0;
  let skipped = 0;
  let truncated = false;

  while (queue.length) {
    if (scannedFiles >= maxFiles || scannedDirectories >= maxDirectories || Date.now() >= deadline) {
      truncated = true;
      break;
    }
    const { folderPath, rootPath, groupPath, isRoot } = queue.shift();
    let entries;
    try { entries = await fs.readdir(folderPath, { withFileTypes: true }); }
    catch { skipped++; continue; }
    scannedDirectories++;

    for (const entry of entries) {
      if (scannedFiles >= maxFiles || Date.now() >= deadline) { truncated = true; break; }
      if (entry.isSymbolicLink()) { skipped++; continue; }
      const fullPath = path.join(folderPath, entry.name);
      if (entry.isDirectory()) {
        if (scannedDirectories + queue.length >= maxDirectories) { truncated = true; continue; }
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

  return {
    files: largestFiles,
    folders: [...folderSizes].map(([folderPath, bytes]) => ({ path: folderPath, bytes }))
      .sort((a, b) => b.bytes - a.bytes).slice(0, 8),
    scannedFiles, scannedDirectories, skipped, truncated,
  };
}

module.exports = { scanStorage };
