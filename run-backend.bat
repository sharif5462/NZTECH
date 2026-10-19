@echo off
title HirePulse - Backend REST API (Port 5000)
echo ====================================================
echo Starting HirePulse Express & TypeScript REST API...
echo URL: http://localhost:5000
echo ====================================================
cd /d "%~dp0backend"
npm run dev
pause
