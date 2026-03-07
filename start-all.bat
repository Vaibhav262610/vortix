@echo off
echo ========================================
echo Starting Vortix - All Services
echo ========================================
echo.

echo Starting Backend...
start "Vortix Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Agent...
start "Vortix Agent" cmd /k "cd agent && node agent.js start"
timeout /t 2 /nobreak >nul

echo Starting Dashboard...
start "Vortix Dashboard" cmd /k "cd dashboard && npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:   http://localhost:8080
echo Dashboard: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
