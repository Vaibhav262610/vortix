function formatBytes(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}

function analyzeRescueSnapshot(latest, previous) {
  if (!latest) return 'No storage scans have been saved yet.';
  if (latest.truncated) return 'This scan reached its time or file limit. Results are partial; scan a smaller location to compare growth.';
  if (!previous || previous.scope !== latest.scope || previous.truncated) {
    return 'Read-only baseline saved. The next scan of this location can show what grew.';
  }
  const older = new Map(previous.folders.map(folder => [folder.path, folder.bytes]));
  const growth = latest.folders.map(folder => ({ path: folder.path, delta: folder.bytes - (older.get(folder.path) || 0),
    wasTracked: older.has(folder.path) })).filter(item => item.wasTracked && item.delta >= 100 * 1024 ** 2)
    .sort((a, b) => b.delta - a.delta);
  if (!growth.length) return 'No tracked top folder grew by 100 MB or more since the last comparable scan.';
  const top = growth[0];
  return `${top.path} grew by about ${formatBytes(top.delta)} since the last comparable scan. Review its files before deciding what to keep.`;
}

module.exports = { analyzeRescueSnapshot };
