@echo off
echo ========================================
echo System Stats Real-Time Test
echo ========================================
echo.
echo This will test if System Stats updates in real-time
echo.
echo Step 1: Make sure backend is running (port 8080)
echo Step 2: Make sure agent is running
echo Step 3: Open dashboard at http://localhost:3000/dashboard
echo Step 4: Select a device
echo Step 5: Check right sidebar for System Stats widget
echo.
echo Press any key to open dashboard...
pause > nul

start http://localhost:3000/dashboard

echo.
echo ========================================
echo What to Check:
echo ========================================
echo.
echo 1. RIGHT SIDEBAR (fixed on right side):
echo    - System Stats widget should be visible
echo    - Shows CPU, Memory, Disk usage bars
echo    - Updates every 3 seconds
echo.
echo 2. BROWSER CONSOLE (F12):
echo    - Should see "SystemStatsWidget: Requesting stats"
echo    - Should see "SystemStatsWidget: Received stats"
echo    - Every 3 seconds
echo.
echo 3. BACKEND TERMINAL:
echo    - Should see "Backend: Received GET_SYSTEM_STATS"
echo    - Should see "Backend: Forwarding SYSTEM_STATS"
echo.
echo 4. AGENT TERMINAL:
echo    - Should see "Agent: Received GET_SYSTEM_STATS"
echo    - Should see "Agent: Sending SYSTEM_STATS"
echo.
echo ========================================
echo.
pause
