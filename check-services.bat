@echo off
echo ========================================
echo Checking Vortix Services Status
echo ========================================
echo.

echo Checking Backend (port 8080)...
netstat -an | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 8080
) else (
    echo [ERROR] Backend is NOT running!
    echo        Start it with: cd backend ^&^& npm start
)
echo.

echo Checking Dashboard (port 3000)...
netstat -an | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo [OK] Dashboard is running on port 3000
) else (
    echo [ERROR] Dashboard is NOT running!
    echo        Start it with: cd dashboard ^&^& npm run dev
)
echo.

echo ========================================
echo Quick Start Commands:
echo ========================================
echo.
echo 1. Start Backend:
echo    cd backend
echo    npm start
echo.
echo 2. Start Agent:
echo    cd agent
echo    node agent.js
echo.
echo 3. Start Dashboard:
echo    cd dashboard
echo    npm run dev
echo.
echo 4. Open Dashboard:
echo    http://localhost:3000/dashboard
echo.
echo ========================================
echo.
pause
