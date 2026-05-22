@echo off
title Forensic Analytics — Stopping System
color 0C
echo.
echo  Stopping Forensic Analytics servers...
echo.

:: Kill uvicorn (backend)
taskkill /f /im "uvicorn.exe" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Forensic Analytics - Backend" >nul 2>&1

:: Kill node (frontend)
taskkill /f /fi "WINDOWTITLE eq Forensic Analytics - Frontend" >nul 2>&1

echo  Servers stopped.
echo.
pause
