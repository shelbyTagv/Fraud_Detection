@echo off
title Forensic Analytics — Frontend
color 0E
echo.
echo  ============================================================
echo   FORENSIC ANALYTICS — FRONTEND
echo   Harare Institute of Technology
echo  ============================================================
echo.
echo  Starting frontend...
echo  The system will open in your browser automatically.
echo  Keep this window open while using the system.
echo.

:: Check node_modules exists
if not exist "frontend\node_modules" (
    echo  ERROR: Frontend not set up yet.
    echo  Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

echo  Make sure the backend is already running (START_BACKEND.bat)
echo  before using the system.
echo.
echo  Opening http://localhost:3000 ...
echo.
echo  ============================================================
echo.

cd frontend
npm start

echo.
echo  Frontend stopped.
pause
