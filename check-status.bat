@echo off
echo ========================================
echo Vortix Status Check
echo ========================================
echo.

echo Checking Backend (Port 8080)...
netstat -an | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 8080
) else (
    echo [ERROR] Backend is NOT running!
    echo Run: cd backend ^&^& npm start
)
echo.

echo Checking Dashboard (Port 3000)...
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo [OK] Dashboard is running on port 3000
) else (
    echo [ERROR] Dashboard is NOT running!
    echo Run: cd dashboard ^&^& npm run dev
)
echo.

echo Checking Files...
if exist "dashboard\contexts\ThemeContext.tsx" (
    echo [OK] ThemeContext.tsx exists
) else (
    echo [ERROR] ThemeContext.tsx NOT FOUND!
)

if exist "dashboard\components\Widget.tsx" (
    echo [OK] Widget.tsx exists
) else (
    echo [ERROR] Widget.tsx NOT FOUND!
)

if exist "backend\server.js" (
    echo [OK] Backend server.js exists
) else (
    echo [ERROR] Backend server.js NOT FOUND!
)

if exist "agent\agent.js" (
    echo [OK] Agent agent.js exists
) else (
    echo [ERROR] Agent agent.js NOT FOUND!
)
echo.

echo ========================================
echo Status Check Complete
echo ========================================
echo.
echo Next Steps:
echo 1. If backend not running: cd backend ^&^& npm start
echo 2. If dashboard not running: cd dashboard ^&^& npm run dev
echo 3. If agent not running: cd agent ^&^& node agent.js start
echo 4. Open browser: http://localhost:3000/dashboard
echo.
pause
