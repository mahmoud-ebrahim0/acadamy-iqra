@echo off
title Acadamy Iqra Start Script
cd /d "%~dp0"
echo ===================================================
echo Starting Acadamy Iqra Project...
echo ===================================================

echo [1] Attempting to start MongoDB Service...
echo (Note: If this fails with Access Denied, please run this script as Administrator)
net start MongoDB

echo.
echo [2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm install && npm start"

echo.
echo [3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo All processes have been initiated! 
echo The frontend will be available at http://localhost:5173
echo The backend will be available at http://localhost:5000
echo.
pause
