@echo off
title HirePulse Standalone REST API (Port 5000)
echo ===================================================
echo Starting Standalone Express REST API Server...
echo API Base: http://localhost:5000
echo ===================================================
cd /d "D:\My Project\RestAPINZtech"
call npm run dev
pause
