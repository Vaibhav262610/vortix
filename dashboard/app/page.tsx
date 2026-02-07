"use client";

import { useEffect, useState, useRef } from "react";

type Device = {
  deviceName: string;
  status: string;
};

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [command, setCommand] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log("Connecting to backend WebSocket...");

    const ws = new WebSocket("ws://localhost:8080?type=dashboard");

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Dashboard connected to backend");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "DEVICES") {
        setDevices(data.devices);
      }

      if (data.type === "APPROVAL_REQUIRED") {
  const confirmExecute = confirm(
    `Dangerous command detected:\n\n${data.command}\n\nExecute anyway?`
  );

  if (confirmExecute) {
    wsRef.current?.send(
      JSON.stringify({
        type: "FORCE_EXECUTE",
        deviceName: data.deviceName,
        command: data.command,
      })
    );
  }
}

      if (data.type === "LOG") {
        setLogs((prev) => [
          ...prev,
          `[${data.deviceName}] ${data.message}`,
        ]);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("Dashboard WebSocket disconnected");
    };
    

    return () => ws.close();
  }, []);




  const sendCommand = () => {
    if (!selectedDevice || !command) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "COMMAND",
        deviceName: selectedDevice,
        command,
      })
    );

    setCommand("");
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white">
      {/* Background: soft gradient + grain */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% -20%, rgba(45, 55, 72, 0.4), transparent 50%), linear-gradient(180deg, #0d0d0f 0%, #12121a 100%)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-8 flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-6">
          <h1 className="text-xl font-semibold tracking-tight text-white/95 sm:text-2xl">
            <b>Vortix</b> Dashboard
          </h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Devices — glass panel */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/45">
              Select Your Device
            </p>
            {devices.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 bg-black/20 py-8 text-center text-sm text-white/50">
                No devices connected
              </p>
            ) : (
              <ul className="space-y-2">
                {devices.map((device, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => setSelectedDevice(device.deviceName)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        selectedDevice === device.deviceName
                          ? "glass-strong text-white"
                          : "text-white/80 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          device.status === "online"
                            ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                            : "bg-white/30"
                        }`}
                      />
                      <span className="min-w-0 truncate font-medium">
                        {device.deviceName}
                      </span>
                      <span
                        className={`ml-auto shrink-0 text-[11px] uppercase tracking-wider ${
                          device.status === "online"
                            ? "text-emerald-400/90"
                            : "text-white/40"
                        }`}
                      >
                        {device.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Main: command + logs */}
          <div className="flex flex-col gap-6">
            {/* Command — glass bar */}
            <div className="glass rounded-2xl p-5 sm:p-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/45">
                Send command
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendCommand()}
                  placeholder="Type a command…"
                  className="glass-input flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button
                  type="button"
                  onClick={sendCommand}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white/95 backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 sm:shrink-0"
                >
                  Send
                </button>
              </div>
              {selectedDevice && (
                <p className="mt-3 text-xs text-white/45">
                  Selected Device: <span className="font-mono text-white/70">{selectedDevice}</span>
                </p>
              )}
            </div>

            {/* Logs — glass window */}
            <div className="glass flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                </div>
                <span className="text-xs font-medium text-white/50">Logs</span>
              </div>
              <div className="flex-1 overflow-auto p-3 font-mono text-[13px] leading-relaxed text-white/75">
                {logs.length === 0 ? (
                  <p className="text-white/35">No entries yet.</p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-transparent py-0.5 pl-3 hover:border-white/20 hover:bg-white/[0.03]"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
