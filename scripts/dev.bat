@echo off
setlocal

cd /d "%~dp0.."

echo.
echo ================================
echo FlashbackVHS Dev Launcher
echo ================================
echo Root: %CD%
echo.

start "FlashbackVHS API" cmd /k call "%~dp0api-dev.bat"

timeout /t 2 /nobreak >nul

start "FlashbackVHS WEB" cmd /k call "%~dp0web-dev.bat"

echo Started API and WEB terminals.
echo.
echo API:  http://127.0.0.1:8000/api/health
echo WEB:  http://localhost:3000
echo.
pause
