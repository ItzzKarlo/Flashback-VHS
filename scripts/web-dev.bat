@echo off
setlocal

cd /d "%~dp0..\apps\web"

echo.
echo ================================
echo Starting FlashbackVHS Web
echo ================================
echo Directory: %CD%
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found.
    echo Install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo npm was not found.
    echo Install Node.js/npm first.
    pause
    exit /b 1
)

if not exist .env.local (
    echo Creating .env.local from example...
    copy .env.local.example .env.local >nul
)

if not exist node_modules (
    echo Installing web dependencies...
    call npm install
    if errorlevel 1 (
        echo npm install failed.
        pause
        exit /b 1
    )
)

echo.
echo Starting Next.js on http://localhost:3000
echo.

call npm run dev

echo.
echo Web server stopped.
pause
