@echo off
echo ========================================
echo Fixing Agent Connection
echo ========================================
echo.

echo [Step 1] Checking if backend is running...
netstat -an | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 8080
) else (
    echo ❌ Backend is NOT running!
    echo.
    echo Starting backend now...
    start "Vortix Backend" cmd /k "cd backend && npm start"
    echo.
    echo Waiting for backend to start...
    timeout /t 5 > nul
    
    netstat -an | findstr ":8080" > nul
    if %errorlevel% equ 0 (
        echo ✅ Backend started successfully
    ) else (
        echo ❌ Backend failed to start!
        echo Check the Backend terminal window for errors
        pause
        exit /b 1
    )
)
echo.

echo [Step 2] Checking agent configuration...
cd agent
if exist "%USERPROFILE%\.vortix-config.json" (
    echo ✅ Agent configuration found
    type "%USERPROFILE%\.vortix-config.json"
) else (
    echo ⚠️  No configuration found
    echo You need to set a password first
    echo.
    echo Run: node agent.js login
    echo Then set a password (e.g., vortix123)
    echo.
    pause
    exit /b 1
)
echo.

echo [Step 3] Starting agent...
echo.
echo Agent will connect to: ws://localhost:8080
echo.
start "Vortix Agent" cmd /k "node agent.js start"

echo.
echo ========================================
echo Agent is starting...
echo ========================================
echo.
echo Check the Agent terminal window for:
echo   ✅ "Authenticated and connected to backend successfully!"
echo.
echo If you see connection errors:
echo   1. Make sure backend is running
echo   2. Check backend terminal for errors
echo   3. Verify password is set: node agent.js login
echo.
pause
