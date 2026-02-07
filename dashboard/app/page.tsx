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
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">⚡ Vortix Control Panel</h1>

      {/* Device List */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Devices</h2>

        {devices.length === 0 && (
          <p className="text-gray-400">No devices connected</p>
        )}

        {devices.map((device, index) => (
          <div key={index} className="mb-2 flex items-center gap-4">
            <button
              onClick={() => setSelectedDevice(device.deviceName)}
              className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700"
            >
              {device.deviceName}
            </button>

            <span
              className={
                device.status === "online"
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {device.status}
            </span>
          </div>
        ))}
      </div>

      {/* Command Input */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Send Command</h2>

        <div className="flex gap-2">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 px-3 py-2 bg-gray-800 rounded"
          />
          <button
            onClick={sendCommand}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            Send
          </button>
        </div>

        {selectedDevice && (
          <p className="text-sm text-gray-400 mt-2">
            Target: {selectedDevice}
          </p>
        )}
      </div>

      {/* Logs */}
      <div>
        <h2 className="text-xl mb-2">Logs</h2>
        <div className="bg-gray-900 p-4 rounded h-64 overflow-auto text-sm">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
