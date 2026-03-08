# System Stats Real-Time Update Test

## What Should Happen

When you connect a device to the dashboard, the System Stats widget should:

1. Immediately request stats when device is selected
2. Update every 3 seconds automatically
3. Show CPU, Memory, and Disk usage in real-time

## Test Steps

### 1. Start Backend

```bash
cd backend
npm start
```

Expected output:

- `Backend server running on port 8080`

### 2. Start Agent

```bash
cd agent
node agent.js
```

Expected output:

- `Agent connected to backend`
- `Device name: [YOUR-DEVICE-NAME]`

### 3. Start Dashboard

```bash
cd dashboard
npm run dev
```

Expected output:

- `Ready on http://localhost:3000`

### 4. Open Dashboard

1. Go to http://localhost:3000/dashboard
2. You should see your device in the device list
3. Click on the device to authenticate (if needed)
4. Enter password if prompted

### 5. Check System Stats Widget

**Location:** Right sidebar (fixed on the right side of the screen)

**What to look for:**

- Widget titled "System Stats" with a chart icon
- Three progress bars:
  - CPU: Shows current CPU usage %
  - Memory: Shows current RAM usage %
  - Disk: Shows disk usage % (currently placeholder at 50%)
- Bars should update every 3 seconds

### 6. Check Browser Console

Open browser DevTools (F12) and check Console tab for:

**Dashboard logs (every 3 seconds):**

```
SystemStatsWidget: Requesting initial stats for [DEVICE-NAME]
SystemStatsWidget: Requesting stats update for [DEVICE-NAME]
SystemStatsWidget: Received stats for [DEVICE-NAME] {cpu: X, memory: Y, disk: Z}
```

**Backend terminal logs:**

```
Backend: Received GET_SYSTEM_STATS request for [DEVICE-NAME]
Backend: Forwarding GET_SYSTEM_STATS to agent: device-[device-name]
Backend: Received SYSTEM_STATS from agent: [DEVICE-NAME] {cpu: X, memory: Y, disk: Z}
Backend: Forwarding SYSTEM_STATS to dashboard for device: [DEVICE-NAME]
```

**Agent terminal logs:**

```
Agent: Received GET_SYSTEM_STATS request
Agent: Sending SYSTEM_STATS: {cpu: X, memory: Y, disk: Z}
```

## Troubleshooting

### Stats Not Showing

1. **Check device is selected:** Device name should show in green badge at top
   of command input
2. **Check WebSocket connection:** Console should not show connection errors
3. **Check authentication:** Device should have green checkmark in device list

### Stats Not Updating

1. **Check console for errors:** Look for WebSocket errors or message parsing
   errors
2. **Check interval is running:** Should see "Requesting stats update" every 3
   seconds
3. **Verify agent is responding:** Check agent terminal for "Sending
   SYSTEM_STATS" logs

### Widget Not Visible

1. **Check right sidebar:** Widget sidebar is fixed on the right side
2. **Scroll if needed:** Sidebar is scrollable if content overflows
3. **Check theme:** Try toggling light/dark theme with 🌙/☀️ button

## Expected Behavior

✅ Stats request sent immediately when device selected ✅ Stats update every 3
seconds automatically ✅ CPU and Memory values are accurate (Disk is
placeholder) ✅ Progress bars animate smoothly when values change ✅ Widget
works in both light and dark themes

## Testing Commands

You can also test command execution while monitoring stats:

1. **Volume Up:** `nircmd changesysvolume 2000`
2. **Volume Down:** `nircmd changesysvolume -2000`
3. **Open Notepad:** `notepad`
4. **List Files:** `dir` (Windows) or `ls` (Mac/Linux)

Commands should execute and show output in the logs section while stats continue
updating in the background.
