@echo off
title NZTech Standalone REST API (Port 5000)
echo ===================================================
echo Starting Standalone Express REST API Server...
echo API Base: http://localhost:5000
echo ===================================================
cd /d "%~dp0"
call npm run dev
pause
