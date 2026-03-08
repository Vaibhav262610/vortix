@echo off
echo ========================================
echo Testing Dashboard Only
echo ========================================
echo.
echo Starting dashboard in development mode...
echo.

cd dashboard
start "Vortix Dashboard DEV" cmd /k "npm run dev"

echo.
echo Waiting for dashboard to start...
timeout /t 5 > nul

echo.
echo Opening dashboard...
start http://localhost:3000/dashboard

echo.
echo ========================================
echo Dashboard should open without errors
echo ========================================
echo.
echo Check the terminal for any errors
echo Press F12 in browser to check console
echo.
echo The theme toggle should work even without
echo backend/agent running
echo.
pause
