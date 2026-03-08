@echo off
echo ========================================
echo Diagnosing Vortix Connection Issues
echo ========================================
echo.

echo [1] Checking if Backend is running on port 8080...
netstat -an | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo     ✅ Port 8080 is OPEN - Backend appears to be running
    netstat -an | findstr ":8080"
) else (
    echo     ❌ Port 8080 is CLOSED - Backend is NOT running!
    echo.
    echo     To start backend:
    echo     cd backend
    echo     npm start
    echo.
)
echo.

echo [2] Checking if Dashboard is running on port 3000...
netstat -an | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo     ✅ Port 3000 is OPEN - Dashboard appears to be running
) else (
    echo     ❌ Port 3000 is CLOSED - Dashboard is NOT running!
    echo.
    echo     To start dashboard:
    echo     cd dashboard
    echo     npm run dev
    echo.
)
echo.

echo [3] Testing Backend WebSocket endpoint...
echo     Attempting to connect to ws://localhost:8080
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" http://localhost:8080 2>nul
if %errorlevel% equ 0 (
    echo     ✅ Backend WebSocket endpoint is responding
) else (
    echo     ⚠️  Could not test WebSocket (curl not available or backend not responding)
)
echo.

echo ========================================
echo Quick Fix Steps:
echo ========================================
echo.
echo If backend is NOT running:
echo   1. Open a new terminal
echo   2. cd backend
echo   3. npm start
echo   4. Wait for "Backend server running on port 8080"
echo.
echo If backend IS running but dashboard can't connect:
echo   1. Stop the backend (Ctrl+C)
echo   2. Restart it: npm start
echo   3. Refresh the dashboard page (F5)
echo.
echo If both are running but still not connecting:
echo   1. Check backend terminal for errors
echo   2. Check if firewall is blocking port 8080
echo   3. Try restarting both services
echo.
pause
