"use client";

import { useEffect, useState } from "react";

type ScanItem = { path: string; bytes: number };
type ScanFile = ScanItem & { name: string };
type ScanResult = {
  files: ScanFile[];
  folders: ScanItem[];
  scannedFiles: number;
  scannedDirectories: number;
  truncated: boolean;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1);
  return `${(bytes / 1024 ** (index + 1)).toFixed(1)} ${units[index]}`;
}

export function StorageRescue({ deviceName, online, ws, onBrowseFolder }: {
  deviceName: string;
  online: boolean;
  ws: WebSocket | null;
  onBrowseFolder: (path: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (!ws || !deviceName) return;
    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "STORAGE_SCAN_RESULT" || data.deviceName !== deviceName) return;
        setLoading(false);
        if (data.error) { setError(data.error); return; }
        setResult({ files: data.files || [], folders: data.folders || [],
          scannedFiles: data.scannedFiles || 0, scannedDirectories: data.scannedDirectories || 0,
          truncated: data.truncated === true });
      } catch { /* Ignore unrelated frames. */ }
    };
    ws.addEventListener("message", onMessage);
    return () => ws.removeEventListener("message", onMessage);
  }, [ws, deviceName]);

  const startScan = () => {
    if (!deviceName || !online || ws?.readyState !== WebSocket.OPEN || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    ws.send(JSON.stringify({ type: "SCAN_STORAGE", deviceName }));
  };

  return <section className="glass rounded-2xl p-5 sm:p-6" aria-labelledby="storage-rescue-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Device health</p>
        <h2 id="storage-rescue-title" className="mt-2 text-xl font-semibold">Find what is filling your storage</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Scan Downloads, Desktop, Documents, Videos, and Pictures on the selected device. See large files and folders before deciding what to keep.</p>
      </div>
      <button type="button" onClick={startScan} disabled={!deviceName || !online || !ws || loading}
        className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#062014] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
        {loading ? "Scanning…" : "Scan storage"}
      </button>
    </div>
    {!deviceName && <p className="mt-5 text-sm text-white/50">Select an online device to run a scan.</p>}
    {deviceName && !online && <p className="mt-5 text-sm text-white/50">This device is offline. Start its agent to scan storage.</p>}
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}
    {result && <div className="mt-6 space-y-6">
      <p className="text-xs text-white/50">Scanned {result.scannedFiles.toLocaleString()} files in {result.scannedDirectories.toLocaleString()} folders.
        {result.truncated ? " Scan limit reached; sizes shown may be incomplete." : " No files were changed."}</p>
      {result.folders.length === 0 && <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">No files found in the common user folders on this device.</p>}
      {result.folders.length > 0 && <div><h3 className="mb-3 text-sm font-semibold">Largest folders</h3><div className="space-y-2">
        {result.folders.map(folder => <div key={folder.path} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="min-w-0"><p className="truncate text-sm text-white/85" title={folder.path}>{folder.path}</p><p className="mt-1 text-xs text-white/45">{formatBytes(folder.bytes)} found</p></div>
          <button type="button" onClick={() => onBrowseFolder(folder.path)} className="shrink-0 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Browse folder →</button>
        </div>)}
      </div></div>}
      {result.files.length > 0 && <div><h3 className="mb-3 text-sm font-semibold">Largest files</h3><div className="space-y-2">
        {result.files.map(file => <div key={file.path} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="min-w-0"><p className="truncate text-sm text-white/85" title={file.path}>{file.name}</p><p className="mt-1 truncate text-xs text-white/45" title={file.path}>{file.path}</p></div>
          <span className="shrink-0 font-mono text-xs text-emerald-300">{formatBytes(file.bytes)}</span>
        </div>)}
      </div></div>}
    </div>}
  </section>;
}
