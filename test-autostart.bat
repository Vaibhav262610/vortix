@echo off
echo ========================================
echo Testing Auto-Start Toggle
echo ========================================
echo.
echo IMPORTANT: This script must be run as Administrator!
echo Right-click and select "Run as administrator"
echo.
pause
echo.

cd agent

echo Step 1: Checking current status...
echo.
node agent.js status
echo.

echo ========================================
echo Step 2: Testing enable...
echo ========================================
echo.
node agent.js enable-autostart
echo.

echo ========================================
echo Step 3: Checking status again...
echo ========================================
echo.
node agent.js status
echo.

echo ========================================
echo Step 4: Verifying Task Scheduler...
echo ========================================
echo.
schtasks /query /tn VortixAgent
echo.

echo ========================================
echo Step 5: Checking VBScript file...
echo ========================================
echo.
if exist "%USERPROFILE%\vortix-agent.vbs" (
    echo ✅ VBScript file exists: %USERPROFILE%\vortix-agent.vbs
) else (
    echo ❌ VBScript file NOT found
)
echo.

echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If all checks passed, auto-start is working!
echo.
echo To test the toggle in dashboard:
echo 1. Run: START_LOCAL_BACKEND.bat (as Administrator)
echo 2. Run: START_LOCAL_AGENT.bat (as Administrator)
echo 3. Run: cd dashboard ^&^& npm run dev
echo 4. Open: http://localhost:3000
echo 5. Click the auto-start toggle
echo.

pause
