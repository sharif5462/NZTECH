@echo off
title NZTech - Frontend (Port 3000)
echo ====================================================
echo Starting NZTech Next.js 14 Frontend...
echo URL: http://localhost:3000
echo ====================================================
cd /d "%~dp0..\frontend"
npm run dev
pause
