@echo off
REM CaliTrack — One-click start script for Windows
REM Just double-click this file

echo Starting CaliTrack...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    echo Download it from: https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies first time only...
    call npm install
    echo.
)

echo Opening CaliTrack at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

start http://localhost:3000
call npm run dev
