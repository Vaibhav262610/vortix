@echo off
echo ========================================
echo Vortix Auto-Fix and Start
echo ========================================
echo.
echo This will automatically:
echo 1. Fix environment variables
echo 2. Stop any running services
echo 3. Start everything fresh
echo.
pause

echo.
echo [Step 1] Fixing environment variables...
cd dashboard
if not exist .env.local (
    echo Creating .env.local...
    echo NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080 > .env.local
    echo ✅ Created .env.local
) else (
    echo ✅ .env.local already exists
)
echo.
echo Current .env.local content:
type .env.local
cd ..
echo.

echo [Step 2] Stopping any running services...
echo Killing processes on port 8080 and 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%a 2>nul
timeout /t 2 > nul
echo ✅ Ports cleared
echo.

echo [Step 3] Starting Backend...
start "Vortix Backend" cmd /k "cd backend && echo Starting Backend... && npm start"
echo Waiting for backend to initialize...
timeout /t 5 > nul
echo.

echo [Step 4] Checking if backend started...
netstat -an | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 8080
) else (
    echo ❌ Backend failed to start!
    echo Check the Backend terminal window for errors
    pause
    exit /b 1
)
echo.

echo [Step 5] Starting Agent...
start "Vortix Agent" cmd /k "cd agent && echo Starting Agent... && node agent.js"
echo Waiting for agent to connect...
timeout /t 3 > nul
echo.

echo [Step 6] Starting Dashboard...
start "Vortix Dashboard" cmd /k "cd dashboard && echo Starting Dashboard... && npm run dev"
echo Waiting for dashboard to initialize...
timeout /t 8 > nul
echo.

echo [Step 7] Checking if dashboard started...
netstat -an | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo ✅ Dashboard is running on port 3000
) else (
    echo ❌ Dashboard failed to start!
    echo Check the Dashboard terminal window for errors
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✅ All Services Started Successfully!
echo ========================================
echo.
echo Backend:   http://localhost:8080 (WebSocket)
echo Dashboard: http://localhost:3000
echo.
echo Opening dashboard in browser...
timeout /t 2 > nul
start http://localhost:3000/dashboard

echo.
echo ========================================
echo What to Check:
echo ========================================
echo.
echo 1. Browser Console (F12):
echo    Should see: "✅ Dashboard connected to backend successfully!"
echo.
echo 2. Backend Terminal:
echo    Should see: "Backend running on port 8080"
echo.
echo 3. Agent Terminal:
echo    Should see: "Agent connected to backend"
echo.
echo 4. Dashboard Terminal:
echo    Should see: "Ready on http://localhost:3000"
echo.
echo If you see WebSocket errors:
echo    - Check the terminal windows for error messages
echo    - Run: diagnose-connection.bat
echo    - Read: WEBSOCKET_CONNECTION_FIX.md
echo.
echo ========================================
echo.
pause
