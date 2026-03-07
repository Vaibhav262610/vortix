# 🚀 Quick Integration Guide

## How to Add New Features to Your Existing Dashboard

Since your current dashboard is 1764 lines, here's the easiest way to integrate
the new features:

---

## Option 1: Add Buttons to Existing Dashboard (Fastest)

### Step 1: Import New Components

Add to top of `dashboard/app/dashboard/page.tsx`:

```typescript
import { useTheme } from "../../contexts/ThemeContext";
import { FileTransfer } from "../../components/FileTransfer";
import { MultiDeviceSelector } from "../../components/MultiDeviceSelector";
import { SystemStatsWidget } from "../../components/SystemStatsWidget";
import { RecentCommandsWidget } from "../../components/RecentCommandsWidget";
import { DeviceStatusWidget } from "../../components/DeviceStatusWidget";
```

### Step 2: Add State Variables

Add after existing state:

```typescript
const { theme, toggleTheme } = useTheme();
const [showFileTransfer, setShowFileTransfer] = useState(false);
const [showMultiDevice, setShowMultiDevice] = useState(false);
const [commandHistory, setCommandHistory] = useState<string[]>([]);
```

### Step 3: Add Theme Toggle Button

In the header, add:

```typescript
<button
  onClick={toggleTheme}
  className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
  title="Toggle theme"
>
  {theme === 'dark' ? '🌙' : '☀️'}
</button>
```

### Step 4: Add Feature Buttons

Add these buttons near your command input:

```typescript
<div className="flex gap-2 mb-4">
  <button
    onClick={() => setShowMultiDevice(true)}
    disabled={!selectedDevice}
    className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 transition"
  >
    Multi-Device
  </button>

  <button
    onClick={() => setShowFileTransfer(true)}
    disabled={!selectedDevice}
    className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 transition"
  >
    Files
  </button>
</div>
```

### Step 5: Add Modals

Add before the closing `</div>` of your component:

```typescript
{/* File Transfer Modal */}
{showFileTransfer && (
  <FileTransfer
    deviceName={selectedDevice}
    ws={wsRef.current}
    onClose={() => setShowFileTransfer(false)}
  />
)}

{/* Multi-Device Modal */}
{showMultiDevice && (
  <MultiDeviceSelector
    devices={devices}
    onExecute={(deviceNames, cmd) => {
      wsRef.current?.send(JSON.stringify({
        type: "MULTI_DEVICE_EXECUTE",
        deviceNames,
        command: cmd,
      }));
    }}
    onClose={() => setShowMultiDevice(false)}
  />
)}
```

### Step 6: Add Widgets Sidebar

Add a sidebar with widgets:

```typescript
{/* Widgets Sidebar */}
<div className="w-80 border-l border-white/10 p-4 space-y-4 overflow-y-auto">
  <SystemStatsWidget
    deviceName={selectedDevice}
    ws={wsRef.current}
  />

  <RecentCommandsWidget
    commands={commandHistory}
    onCommandClick={(cmd) => {
      setCommand(cmd);
      sendCommand();
    }}
  />

  <DeviceStatusWidget
    devices={devices}
    selectedDevice={selectedDevice}
    onDeviceSelect={handleDeviceClick}
  />
</div>
```

### Step 7: Track Command History

Update your `sendCommand` function:

```typescript
const sendCommand = () => {
	if (!selectedDevice || !command) return;

	setIsPlanning(true);
	setIsExecuting(true);

	// Add this line:
	setCommandHistory((prev) => [...prev, command]);

	const userApiKey = localStorage.getItem("groq_api_key");

	wsRef.current?.send(
		JSON.stringify({
			type: "PLAN",
			deviceName: selectedDevice,
			command,
			apiKey: userApiKey || undefined,
		}),
	);

	setCommand("");
};
```

---

## Option 2: Use New Dashboard (Recommended for Clean Start)

### Step 1: Complete dashboard-new/page.tsx

The file is already started. You need to add:

1. **Main layout** with widgets
2. **Command input area**
3. **Logs display**
4. **All modals**

### Step 2: Copy This Layout

Add after the header in `dashboard/app/dashboard-new/page.tsx`:

```typescript
{/* Main Content */}
<div className="container mx-auto px-4 py-6">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Left Sidebar - Widgets */}
    <div className="lg:col-span-1 space-y-4">
      <SystemStatsWidget
        deviceName={selectedDevice}
        ws={wsRef.current}
      />

      <DeviceStatusWidget
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceSelect={handleDeviceClick}
      />

      <RecentCommandsWidget
        commands={commandHistory}
        onCommandClick={(cmd) => {
          setCommand(cmd);
        }}
      />
    </div>

    {/* Main Area */}
    <div className="lg:col-span-3 space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowMultiDevice(true)}
          disabled={devices.filter(d => d.authenticated && d.status === "online").length < 2}
          className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Multi-Device
        </button>

        <button
          onClick={() => setShowFileTransfer(true)}
          disabled={!selectedDevice}
          className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Files
        </button>

        <button
          onClick={startScreenShare}
          disabled={!selectedDevice}
          className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Screen Share
        </button>

        <button
          onClick={() => setShowQuickCommands(true)}
          className="px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400 transition"
        >
          Quick Commands
        </button>

        <button
          onClick={toggleAutoStart}
          disabled={!selectedDevice}
          className={`px-4 py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
            autoStartEnabled[selectedDevice]
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
              : "bg-white/5 border-white/10 text-white/60"
          }`}
        >
          Auto-Start: {autoStartEnabled[selectedDevice] ? "ON" : "OFF"}
        </button>
      </div>

      {/* Command Input */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="mb-4">
          <label className="text-sm font-medium text-white/80 mb-2 block">
            Selected Device: {selectedDevice || "None"}
          </label>
        </div>

        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Enter") {
              e.preventDefault();
              sendCommand();
            }
          }}
          placeholder="Enter command or natural language (e.g., 'show me all files on desktop')"
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none mb-4"
          rows={3}
        />

        <div className="flex gap-3">
          <button
            onClick={sendCommand}
            disabled={!selectedDevice || !command || isExecuting || isPlanning}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              selectedDevice && command && !isExecuting && !isPlanning
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-white/5 text-white/40 cursor-not-allowed"
            }`}
          >
            {isPlanning ? "Planning..." : isExecuting ? "Executing..." : "Send Command (Ctrl+Enter)"}
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Logs</h3>
          <button
            onClick={() => setLogs([])}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 transition"
          >
            Clear
          </button>
        </div>

        <div
          ref={logsRef}
          className="h-64 overflow-y-auto bg-black/40 rounded-lg p-4 font-mono text-xs text-white/80 space-y-1"
        >
          {logs.length === 0 ? (
            <p className="text-white/40 text-center py-8">No logs yet</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-all">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
</div>

{/* Modals */}
{showFileTransfer && (
  <FileTransfer
    deviceName={selectedDevice}
    ws={wsRef.current}
    onClose={() => setShowFileTransfer(false)}
  />
)}

{showMultiDevice && (
  <MultiDeviceSelector
    devices={devices}
    onExecute={handleMultiDeviceExecute}
    onClose={() => setShowMultiDevice(false)}
  />
)}

{/* Auth Dialog */}
{authDialog?.isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">
        Enter Device Password
      </h3>
      <p className="text-sm text-white/60 mb-4">
        Device: <span className="font-mono text-emerald-400">{authDialog.deviceName}</span>
      </p>
      <input
        type="password"
        value={authPassword}
        onChange={(e) => setAuthPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAuthSubmit()}
        placeholder="Enter password..."
        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mb-4"
        autoFocus
      />
      <div className="flex gap-3">
        <button
          onClick={() => {
            setAuthDialog(null);
            setAuthPassword("");
          }}
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm font-medium hover:bg-white/10 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleAuthSubmit}
          disabled={!authPassword}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
            authPassword
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-white/5 text-white/40 cursor-not-allowed"
          }`}
        >
          Unlock
        </button>
      </div>
    </div>
  </div>
)}
```

### Step 3: Test the New Dashboard

1. Navigate to `http://localhost:3000/dashboard-new`
2. Test all features
3. If everything works, replace old dashboard

---

## ✅ Quick Checklist

- [ ] ThemeProvider added to layout.tsx
- [ ] Theme toggle button in header
- [ ] Multi-Device button added
- [ ] Files button added
- [ ] Widgets added to sidebar
- [ ] Command history tracked
- [ ] All modals integrated
- [ ] WebSocket handlers connected
- [ ] Tested locally
- [ ] No console errors

---

## 🎯 Minimal Integration (5 Minutes)

If you just want to test quickly:

1. **Add theme toggle** to header
2. **Add one button** for file transfer
3. **Add one widget** (System Stats)
4. **Test** to see if it works

Then gradually add more features!

---

## 📝 Notes

- All backend code is ready
- All agent code is ready
- All components are ready
- Just need UI integration
- Start small, test often

---

**You're almost done!** 🎉

Just add the UI elements and you'll have a fully enhanced Vortix system!
