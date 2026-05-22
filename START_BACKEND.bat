@echo off
title Forensic Analytics — Backend Server
color 0B
echo.
echo  ============================================================
echo   FORENSIC ANALYTICS — BACKEND SERVER
echo   Harare Institute of Technology
echo  ============================================================
echo.
echo  Starting backend API server...
echo  Keep this window open while using the system.
echo  To stop the server, close this window.
echo.

:: Check virtual environment exists
if not exist "backend\venv\Scripts\activate.bat" (
    echo  ERROR: Backend not set up yet.
    echo  Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

cd backend
call venv\Scripts\activate.bat

echo  Backend starting on http://localhost:8000
echo  API documentation at http://localhost:8000/docs
echo.
echo  ============================================================
echo.

uvicorn main:app --reload --host 127.0.0.1 --port 8000

:: If uvicorn exits unexpectedly, keep window open so error is visible
echo.
echo  Backend server stopped.
echo  If this was unexpected, check the error message above.
pause
