@echo off
echo ========================================
echo Starting Vortix System with Logging
echo ========================================
echo.
echo This will start:
echo 1. Backend (port 8080)
echo 2. Agent (connects to backend)
echo 3. Dashboard (port 3000)
echo.
echo All logs will be visible in separate windows
echo.
pause

echo Starting Backend...
start "Vortix Backend" cmd /k "cd backend && echo Backend Starting... && npm start"
timeout /t 3 > nul

echo Starting Agent...
start "Vortix Agent" cmd /k "cd agent && echo Agent Starting... && node agent.js"
timeout /t 2 > nul

echo Starting Dashboard...
start "Vortix Dashboard" cmd /k "cd dashboard && echo Dashboard Starting... && npm run dev"
timeout /t 3 > nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Check the 3 terminal windows for logs:
echo - Backend: Should show "Backend server running on port 8080"
echo - Agent: Should show "Agent connected to backend"
echo - Dashboard: Should show "Ready on http://localhost:3000"
echo.
echo Opening dashboard in 5 seconds...
timeout /t 5 > nul

start http://localhost:3000/dashboard

echo.
echo ========================================
echo System Stats Testing:
echo ========================================
echo.
echo 1. Authenticate your device in the dashboard
echo 2. Look at the RIGHT SIDEBAR
echo 3. You should see "System Stats" widget
echo 4. CPU and Memory bars should update every 3 seconds
echo.
echo Press F12 in browser to see console logs
echo.
pause
