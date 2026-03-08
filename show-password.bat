@echo off
echo ========================================
echo Device Password Information
echo ========================================
echo.

if exist "%USERPROFILE%\.vortix-config.json" (
    echo ✅ Configuration file found!
    echo.
    echo Location: %USERPROFILE%\.vortix-config.json
    echo.
    echo Current configuration:
    type "%USERPROFILE%\.vortix-config.json"
    echo.
    echo.
    echo ========================================
    echo Your Device Password:
    echo ========================================
    for /f "tokens=2 delims=:}" %%a in ('type "%USERPROFILE%\.vortix-config.json"') do (
        set password=%%a
    )
    echo.
    echo Use this password in the dashboard to authenticate your device.
    echo.
) else (
    echo ❌ Configuration file NOT found!
    echo.
    echo Location should be: %USERPROFILE%\.vortix-config.json
    echo.
    echo To set a password, run:
    echo   cd agent
    echo   node agent.js login
    echo.
    echo Or create default password:
    echo   echo {"password":"vortix123"} ^> %USERPROFILE%\.vortix-config.json
    echo.
    echo Then your password will be: vortix123
)

echo.
echo ========================================
echo How to Change Password:
echo ========================================
echo.
echo 1. Run: cd agent
echo 2. Run: node agent.js login
echo 3. Enter new password when prompted
echo 4. Restart agent: node agent.js start
echo.
pause
