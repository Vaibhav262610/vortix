@echo off
echo ========================================
echo Fixing WebSocket Connection Issue
echo ========================================
echo.

echo Step 1: Verifying environment variables...
echo.
cd dashboard
if exist .env.local (
    echo ✅ .env.local exists
    type .env.local
) else (
    echo ❌ .env.local NOT found!
    echo Creating .env.local...
    echo NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080 > .env.local
    echo ✅ Created .env.local
)
echo.

echo Step 2: Checking if backend is running...
cd ..
netstat -an | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 8080
) else (
    echo ❌ Backend is NOT running!
    echo.
    echo Starting backend now...
    start "Vortix Backend" cmd /k "cd backend && npm start"
    echo Waiting for backend to start...
    timeout /t 5 > nul
)
echo.

echo Step 3: Restarting dashboard...
echo.
echo ⚠️  IMPORTANT: Close the current dashboard terminal window
echo    Then this script will start a new one with correct environment
echo.
pause

echo Starting dashboard with environment variables...
cd dashboard
start "Vortix Dashboard" cmd /k "npm run dev"

echo.
echo ========================================
echo Dashboard is restarting...
echo ========================================
echo.
echo Wait for "Ready on http://localhost:3000"
echo Then refresh your browser (F5)
echo.
echo The WebSocket should now connect to ws://localhost:8080
echo.
pause
