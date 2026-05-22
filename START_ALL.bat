@echo off
title Forensic Analytics — Starting System
color 0A
echo.
echo  ============================================================
echo   FORENSIC ANALYTICS PROTOTYPE
echo   Harare Institute of Technology
echo  ============================================================
echo.

:: Check setup has been done
if not exist "backend\venv\Scripts\activate.bat" (
    echo  ERROR: System not set up yet.
    echo  Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo  ERROR: System not set up yet.
    echo  Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

echo  Starting backend server in a new window...
start "Forensic Analytics - Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && echo Backend starting... && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo  Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo  Starting frontend in a new window...
start "Forensic Analytics - Frontend" cmd /k "cd frontend && echo Frontend starting... && npm start"

echo.
echo  ============================================================
echo   Both servers are starting in separate windows.
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000  (opens in browser)
echo.
echo   IMPORTANT: Keep both windows open while using the system.
echo   To stop: close both server windows.
echo  ============================================================
echo.
echo  The browser will open automatically in a few seconds.
echo.
pause
