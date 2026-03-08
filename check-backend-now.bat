@echo off
echo ========================================
echo Checking Backend Status
echo ========================================
echo.

echo [1] Checking if port 8080 is open...
netstat -an | findstr ":8080"
if %errorlevel% equ 0 (
    echo.
    echo ✅ Port 8080 is OPEN
    echo.
    echo Something is listening on port 8080
    echo This should be the backend server
) else (
    echo.
    echo ❌ Port 8080 is CLOSED
    echo.
    echo Backend is NOT running!
    echo.
    echo Starting backend now...
    cd backend
    start "Vortix Backend" cmd /k "npm start"
    echo.
    echo Wait 5 seconds for backend to start...
    timeout /t 5 > nul
    cd ..
    echo.
    echo Checking again...
    netstat -an | findstr ":8080"
    if %errorlevel% equ 0 (
        echo ✅ Backend started successfully!
    ) else (
        echo ❌ Backend still not running!
        echo Check the Backend terminal window for errors
    )
)

echo.
echo [2] Testing HTTP connection to backend...
curl -s http://localhost:8080 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is responding to HTTP requests
) else (
    echo ⚠️  Backend not responding (this might be normal for WebSocket-only server)
)

echo.
echo [3] Checking backend process...
tasklist | findstr "node.exe" > nul
if %errorlevel% equ 0 (
    echo ✅ Node.js processes are running
    tasklist | findstr "node.exe"
) else (
    echo ❌ No Node.js processes found
)

echo.
echo ========================================
echo Summary:
echo ========================================
echo.
echo If port 8080 is OPEN:
echo   - Backend is running
echo   - Dashboard should be able to connect
echo   - If dashboard still can't connect, restart it
echo.
echo If port 8080 is CLOSED:
echo   - Start backend: cd backend ^&^& npm start
echo   - Wait for "Backend running on port 8080"
echo   - Then refresh dashboard
echo.
pause
