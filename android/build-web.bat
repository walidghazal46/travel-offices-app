@echo off
setlocal

:: Move to project root (one level up from android/)
cd /d "%~dp0.."

echo [build-web] Working dir: %CD%

:: Run npm build
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [build-web] ERROR: npm run build failed with code %ERRORLEVEL%
    exit /b 1
)

:: Copy web assets into android assets folder
call npx cap copy android
if %ERRORLEVEL% NEQ 0 (
    echo [build-web] ERROR: npx cap copy android failed with code %ERRORLEVEL%
    exit /b 1
)

echo [build-web] Done - web assets ready
exit /b 0
