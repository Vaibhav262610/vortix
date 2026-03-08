@echo off
echo ========================================
echo Starting Backend Server ONLY
echo ========================================
echo.

echo Checking if backend is already running...
netstat -an | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  Port 8080 is already in use!
    echo.
    echo Killing existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /F /PID %%a 2>nul
    timeout /t 2 > nul
)

echo.
echo Starting backend server...
echo.
cd backend

echo ========================================
echo Backend will start in a new window
echo ========================================
echo.
echo Look for this message:
echo   "Backend running on port 8080"
echo.
echo If you see errors:
echo   - Check if node_modules exists
echo   - Run: npm install
echo   - Check package.json is correct
echo.
pause

start "Vortix Backend Server" cmd /k "echo ======================================== && echo VORTIX BACKEND SERVER && echo ======================================== && npm start"

cd ..

echo.
echo Waiting for backend to start...
timeout /t 5 > nul

echo.
echo Checking if backend started...
netstat -an | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Backend is running on port 8080
    echo.
    echo You can now:
    echo   1. Start the agent: cd agent ^&^& node agent.js start
    echo   2. Start the dashboard: cd dashboard ^&^& npm run dev
    echo   3. Open browser: http://localhost:3000/dashboard
) else (
    echo.
    echo ❌ FAILED! Backend did not start
    echo.
    echo Check the Backend terminal window for errors
    echo.
    echo Common issues:
    echo   - node_modules missing: cd backend ^&^& npm install
    echo   - Port 8080 blocked by firewall
    echo   - Node.js not installed
)

echo.
pause
