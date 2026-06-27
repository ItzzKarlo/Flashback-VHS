@echo off
setlocal

cd /d "%~dp0.."

echo Cleaning local uploads and renders...
for %%D in (storage\uploads storage\renders storage\previews storage\temp) do (
    if exist "%%D" (
        for /f "delims=" %%F in ('dir /b /a "%%D"') do (
            if /I not "%%F"==".gitkeep" del /f /q "%%D\%%F" 2>nul
        )
    )
)

echo Done.
pause
