@echo off
echo ========================================
echo Vortix Production Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Start Backend
echo Starting Backend Server...
start "Vortix Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

REM Start Agent
echo Starting Agent...
start "Vortix Agent" cmd /k "cd agent && node agent.js start"
timeout /t 2 /nobreak >nul

REM Start Dashboard
echo Starting Dashboard...
start "Vortix Dashboard" cmd /k "cd dashboard && npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:   http://localhost:8080
echo Dashboard: http://localhost:3000
echo Agent:     Running in background
echo.
echo Press any key to open dashboard in browser...
pause >nul

start http://localhost:3000

echo.
echo To stop all services, close the terminal windows.
echo.
pause
