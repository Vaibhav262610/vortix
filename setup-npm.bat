@echo off
echo ========================================
echo Vortix npm Publishing Setup
echo ========================================
echo.

echo Step 1: Checking npm login status...
npm whoami
if %errorlevel% neq 0 (
    echo.
    echo You are not logged in to npm.
    echo Please run: npm login
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Installing dependencies...
cd cli_vortix
call npm install

echo.
echo Step 3: Testing package locally...
call npm link

echo.
echo Step 4: Testing vortix command...
call vortix help

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo To publish to npm, run:
echo   cd cli_vortix
echo   npm publish --access public
echo.
pause
