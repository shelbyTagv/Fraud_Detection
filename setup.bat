@echo off
title Forensic Analytics — First Time Setup
color 0A
echo.
echo  ============================================================
echo   FORENSIC ANALYTICS PROTOTYPE — FIRST TIME SETUP
echo   Harare Institute of Technology
echo  ============================================================
echo.
echo  This will set up everything needed to run the system.
echo  Please wait — this may take 3 to 5 minutes.
echo.
pause

:: ── CHECK PYTHON ─────────────────────────────────────────────────────────────
echo.
echo  [1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Python is not installed or not in PATH.
    echo.
    echo  Please install Python 3.10 or newer from:
    echo  https://www.python.org/downloads/
    echo.
    echo  IMPORTANT: During installation, tick the box that says
    echo  "Add Python to PATH" before clicking Install.
    echo.
    pause
    exit /b 1
)
python --version
echo  Python found. OK.

:: ── CHECK NODE ────────────────────────────────────────────────────────────────
echo.
echo  [2/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Node.js is not installed or not in PATH.
    echo.
    echo  Please install Node.js from:
    echo  https://nodejs.org/  (download the LTS version)
    echo.
    echo  After installing, close this window and run setup.bat again.
    echo.
    pause
    exit /b 1
)
node --version
echo  Node.js found. OK.

:: ── BACKEND SETUP ─────────────────────────────────────────────────────────────
echo.
echo  [3/5] Setting up Python backend...
echo  Creating virtual environment...
cd backend
python -m venv venv
if %errorlevel% neq 0 (
    echo  ERROR: Could not create virtual environment.
    pause
    exit /b 1
)

echo  Activating virtual environment...
call venv\Scripts\activate.bat

echo  Installing backend packages (this takes 2-3 minutes)...
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Failed to install backend packages.
    echo  Check your internet connection and try again.
    pause
    exit /b 1
)
echo  Backend packages installed. OK.

:: ── GENERATE SAMPLE DATA ──────────────────────────────────────────────────────
echo.
echo  [4/5] Generating sample transaction data...
python utils/data_generator.py
if %errorlevel% neq 0 (
    echo  WARNING: Could not generate sample data. You can do this manually later.
)
echo  Sample data ready. OK.

deactivate
cd ..

:: ── FRONTEND SETUP ────────────────────────────────────────────────────────────
echo.
echo  [5/5] Setting up React frontend (this takes 1-2 minutes)...
cd frontend
call npm install --silent
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Failed to install frontend packages.
    echo  Check your internet connection and try again.
    pause
    exit /b 1
)
echo  Frontend packages installed. OK.
cd ..

:: ── DONE ──────────────────────────────────────────────────────────────────────
echo.
echo  ============================================================
echo   SETUP COMPLETE
echo  ============================================================
echo.
echo  You can now run the system using:
echo.
echo    START_BACKEND.bat   (run this first, keep it open)
echo    START_FRONTEND.bat  (run this second)
echo.
echo  Both files are in this folder.
echo.
pause
