# System Stats Real-Time Verification Guide

## Quick Start

Run this command to start everything with logs:

```bash
start-all-with-logs.bat
```

Or manually:

1. Terminal 1: `cd backend && npm start`
2. Terminal 2: `cd agent && node agent.js`
3. Terminal 3: `cd dashboard && npm run dev`
4. Browser: http://localhost:3000/dashboard

---

## What You Should See

### 1. Dashboard UI (Right Sidebar)

**Location:** Fixed on the RIGHT side of the screen

**Widgets (top to bottom):**

```
┌─────────────────────────────────┐
│  📊 System Stats                │
│  ├─ CPU: ████████░░ 80%        │
│  ├─ Memory: ██████░░░░ 60%     │
│  └─ Disk: █████░░░░░ 50%       │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  💻 Devices                     │
│  ├─ Online: 1                   │
│  ├─ Offline: 0                  │
│  └─ Locked: 0                   │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  🕐 Recent Commands             │
│  └─ (your recent commands)      │
└─────────────────────────────────┘
```

### 2. Browser Console (F12 → Console Tab)

**Every 3 seconds you should see:**

```
SystemStatsWidget: Requesting stats update for [DEVICE-NAME]
SystemStatsWidget: Received stats for [DEVICE-NAME] {cpu: 45, memory: 62, disk: 50}
```

**Initial load:**

```
SystemStatsWidget: Starting stats monitoring for [DEVICE-NAME]
SystemStatsWidget: Requesting initial stats for [DEVICE-NAME]
```

### 3. Backend Terminal

**When stats are requested:**

```
Backend: Received GET_SYSTEM_STATS request for [DEVICE-NAME]
Backend: Forwarding GET_SYSTEM_STATS to agent: device-[device-name]
Backend: Received SYSTEM_STATS from agent: [DEVICE-NAME] {cpu: 45, memory: 62, disk: 50}
Backend: Forwarding SYSTEM_STATS to dashboard for device: [DEVICE-NAME]
```

### 4. Agent Terminal

**When stats are requested:**

```
Agent: Received GET_SYSTEM_STATS request
Agent: Sending SYSTEM_STATS: {cpu: 45, memory: 62, disk: 50}
```

---

## Testing Flow

### Step 1: Verify Services Running

```bash
check-services.bat
```

Should show:

- ✅ Backend running on port 8080
- ✅ Dashboard running on port 3000

### Step 2: Connect Device

1. Open http://localhost:3000/dashboard
2. You should see your device in the device list
3. Click the device to select it
4. Enter password if prompted (default: `vortix123`)

### Step 3: Verify System Stats Widget

**Widget should show:**

- Title: "System Stats" with chart icon
- Three colored progress bars:
  - 🔵 CPU (blue)
  - 🟣 Memory (purple)
  - 🟢 Disk (green)
- Percentage values on the right
- Bars should animate when values change

**Update frequency:** Every 3 seconds

### Step 4: Test Real-Time Updates

**Watch the progress bars:**

1. Open Task Manager (Ctrl+Shift+Esc)
2. Go to Performance tab
3. Run a CPU-intensive task (e.g., open multiple programs)
4. Watch the CPU bar in the dashboard increase
5. Close programs and watch it decrease

**Memory test:**

1. Open several browser tabs
2. Watch Memory bar increase
3. Close tabs and watch it decrease

### Step 5: Verify Logs

**Open browser console (F12):**

- Should see stats requests every 3 seconds
- Should see stats responses with actual values
- No errors should appear

**Check backend terminal:**

- Should see forwarding messages every 3 seconds
- No errors should appear

**Check agent terminal:**

- Should see stats calculation and sending every 3 seconds
- No errors should appear

---

## Troubleshooting

### ❌ Widget Not Visible

**Check:**

1. Scroll to the right - sidebar is fixed on right edge
2. Device must be selected (green badge at top)
3. Try toggling theme (🌙/☀️ button)
4. Refresh page (F5)

**Fix:**

- Make sure you selected a device from the device list
- Check that device is authenticated (green checkmark)

### ❌ Stats Not Updating

**Check browser console for:**

```
SystemStatsWidget: No WebSocket or device selected
```

**Fix:**

1. Select a device from the device list
2. Make sure device is online (green dot)
3. Check WebSocket connection (should not see connection errors)

### ❌ Stats Show 0% for Everything

**Check agent terminal for:**

```
Agent: Received GET_SYSTEM_STATS request
Agent: Sending SYSTEM_STATS: {cpu: 0, memory: 0, disk: 0}
```

**Fix:**

- Agent might need to be restarted
- Run: `cd agent && node agent.js`

### ❌ Backend Not Forwarding

**Check backend terminal for:**

```
Backend: Device not authenticated: device-[name]
Backend: Device not found or offline: device-[name]
```

**Fix:**

1. Make sure agent is connected
2. Authenticate device in dashboard
3. Check device name matches (case-insensitive)

---

## Expected Behavior Checklist

✅ **Widget Visibility:**

- [ ] System Stats widget visible in right sidebar
- [ ] Three progress bars (CPU, Memory, Disk) visible
- [ ] Percentage values displayed
- [ ] Widget has proper styling (glass effect)

✅ **Real-Time Updates:**

- [ ] Stats request sent immediately when device selected
- [ ] Stats update every 3 seconds automatically
- [ ] Progress bars animate smoothly
- [ ] Values change based on actual system usage

✅ **Console Logs:**

- [ ] Dashboard logs show stats requests every 3 seconds
- [ ] Dashboard logs show stats responses with values
- [ ] Backend logs show forwarding messages
- [ ] Agent logs show stats calculation and sending

✅ **Theme Support:**

- [ ] Widget visible in dark theme
- [ ] Widget visible in light theme
- [ ] Text readable in both themes
- [ ] Progress bars visible in both themes

✅ **Command Execution:**

- [ ] Can execute commands while stats update
- [ ] Stats continue updating during command execution
- [ ] No interference between features

---

## Test Commands

While monitoring stats, try these commands:

**Windows:**

```
dir
notepad
tasklist
systeminfo
```

**Mac/Linux:**

```
ls
open -a TextEdit
ps aux
top -l 1
```

Stats should continue updating in the background while commands execute.

---

## Success Criteria

✅ System Stats widget is visible on the right sidebar ✅ CPU and Memory values
are accurate and realistic ✅ Values update every 3 seconds automatically ✅
Progress bars animate smoothly ✅ No errors in any console/terminal ✅ Works in
both light and dark themes ✅ Commands can be executed while stats update ✅
Multiple devices can be monitored (switch between them)

---

## Need Help?

If stats are not showing:

1. Run `check-services.bat` to verify services are running
2. Check all three terminals for error messages
3. Open browser console (F12) and look for errors
4. Make sure device is selected and authenticated
5. Try refreshing the dashboard page (F5)
6. Restart all services using `start-all-with-logs.bat`
