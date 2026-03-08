# Quick System Stats Test

## 1. Start Everything

```bash
start-all-with-logs.bat
```

## 2. Open Dashboard

http://localhost:3000/dashboard

## 3. What to Look For

### RIGHT SIDEBAR (Fixed on Right Edge)

```
📊 System Stats
├─ CPU: ████████░░ 80%
├─ Memory: ██████░░░░ 60%
└─ Disk: █████░░░░░ 50%
```

### Browser Console (F12)

```
SystemStatsWidget: Requesting stats update for [DEVICE]
SystemStatsWidget: Received stats for [DEVICE] {cpu: X, memory: Y, disk: Z}
```

↑ Should repeat every 3 seconds

### Backend Terminal

```
Backend: Received GET_SYSTEM_STATS request for [DEVICE]
Backend: Forwarding SYSTEM_STATS to dashboard for device: [DEVICE]
```

↑ Should repeat every 3 seconds

### Agent Terminal

```
Agent: Received GET_SYSTEM_STATS request
Agent: Sending SYSTEM_STATS: {cpu: X, memory: Y, disk: Z}
```

↑ Should repeat every 3 seconds

## 4. Test Real-Time Updates

1. Open Task Manager (Ctrl+Shift+Esc)
2. Run some programs to increase CPU/Memory
3. Watch the bars in the dashboard increase
4. Close programs and watch bars decrease

## ✅ Success = Bars update every 3 seconds with real values

## ❌ Not Working?

1. Check device is selected (green badge at top)
2. Check right sidebar is visible (scroll right if needed)
3. Check browser console for errors (F12)
4. Restart services: Close all terminals and run `start-all-with-logs.bat` again
