@echo off
setlocal

cd /d "%~dp0..\apps\api"

echo.
echo ================================
echo Starting FlashbackVHS API
echo ================================
echo Directory: %CD%
echo.

if not exist .env (
    echo Creating .env from example...
    copy .env.example .env >nul
)

if not exist .venv (
    echo Creating Python virtual environment...
    py -m venv .venv
)

call .venv\Scripts\activate.bat

echo Installing API dependencies...
call pip install -r requirements.txt
if errorlevel 1 (
    echo pip install failed.
    pause
    exit /b 1
)

echo.
echo Starting FastAPI on http://127.0.0.1:8000
echo.

python main.py

echo.
echo API server stopped.
pause
