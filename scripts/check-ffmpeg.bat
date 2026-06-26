@echo off
setlocal

cd /d "%~dp0..\apps\api"

echo.
echo ================================
echo Checking FlashbackVHS FFmpeg
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

call pip install -r requirements.txt
if errorlevel 1 (
    echo pip install failed.
    pause
    exit /b 1
)

python -c "from app.services.ffmpeg_service import check_ffmpeg, check_ffprobe; import json; print(json.dumps({'ffmpeg': check_ffmpeg(), 'ffprobe': check_ffprobe()}, indent=2))"

pause
