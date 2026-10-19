@echo off
title HirePulse - Frontend (Port 3000)
echo ====================================================
echo Starting HirePulse Next.js 14 Frontend...
echo URL: http://localhost:3000
echo ====================================================
cd /d "%~dp0frontend"
npm run dev
pause
