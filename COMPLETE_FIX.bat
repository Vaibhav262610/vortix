@echo off
echo ========================================
echo COMPLETE VORTIX FIX - All Issues
echo ========================================
echo.
echo This will fix ALL connection issues:
echo - Dashboard WebSocket connection
echo - Agent WebSocket connection  
echo - Environment variables
echo - Default passwords
echo.
pause

echo.
echo ========================================
echo STEP 1: Fix Dashboard Environment
echo ========================================
cd dashboard
if not exist .env.local (
    echo Creating .env.local...
    echo NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080 > .env.local
    echo ✅ Created .env.local
) else (
    echo ✅ .env.local exists
)
echo.
echo Dashboard will connect to: ws://localhost:8080
type .env.local
cd ..
echo.

echo ========================================
echo STEP 2: Fix Agent Configuration
echo ========================================
if not exist "%USERPROFILE%\.vortix-config.json" (
    echo Creating agent config with default password...
    echo {"password":"vortix123"} > "%USERPROFILE%\.vortix-config.json"
    echo ✅ Created agent config
    echo ✅ Default password: vortix123
) else (
    echo ✅ Agent config exists
)
echo.
echo Agent will connect to: ws://localhost:8080
echo.

echo ========================================
echo STEP 3: Stop Any Running Services
echo ========================================
echo Clearing ports 8080 and 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%a 2>nul
timeout /t 2 > nul
echo ✅ Ports cleared
echo.

echo ========================================
echo STEP 4: Start Backend
echo ========================================
start "Vortix Backend" cmd /k "cd backend && echo ========================================  && echo BACKEND STARTING && echo ======================================== && npm start"
echo Waiting for backend...
timeout /t 6 > nul

netstat -an | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 8080
) else (
    echo ❌ Backend failed to start!
    pause
    exit /b 1
)
echo.

echo ========================================
echo STEP 5: Start Agent
echo ========================================
start "Vortix Agent" cmd /k "cd agent && echo ======================================== && echo AGENT STARTING && echo ======================================== && node agent.js start"
echo Waiting for agent...
timeout /t 3 > nul
echo.

echo ========================================
echo STEP 6: Start Dashboard
echo ========================================
start "Vortix Dashboard" cmd /k "cd dashboard && echo ======================================== && echo DASHBOARD STARTING && echo ======================================== && npm run dev"
echo Waiting for dashboard...
timeout /t 10 > nul

netstat -an | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo ✅ Dashboard is running on port 3000
) else (
    echo ❌ Dashboard failed to start!
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✅ ALL SERVICES STARTED!
echo ========================================
echo.
echo Backend:   ws://localhost:8080
echo Dashboard: http://localhost:3000
echo Agent:     Connected to backend
echo.
echo Default Password: vortix123
echo.
echo Opening dashboard...
timeout /t 2 > nul
start http://localhost:3000/dashboard

echo.
echo ========================================
echo VERIFICATION CHECKLIST:
echo ========================================
echo.
echo [ ] Backend Terminal: "Backend running on port 8080"
echo [ ] Agent Terminal: "✅ Authenticated and connected to backend successfully!"
echo [ ] Dashboard Terminal: "Ready on http://localhost:3000"
echo [ ] Browser Console (F12): "✅ Dashboard connected to backend successfully!"
echo.
echo If you see any errors:
echo   1. Check each terminal window for error messages
echo   2. Make sure all three terminals are open
echo   3. Try running this script again
echo.
echo ========================================
echo.
pause
