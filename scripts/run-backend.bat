@echo off
title NZTech - Backend REST API (Port 5000)
echo ====================================================
echo Starting NZTech Express & TypeScript REST API...
echo URL: http://localhost:5000
echo ====================================================
cd /d "%~dp0..\backend"
npm run dev
pause
