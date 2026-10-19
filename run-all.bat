@echo off
title HirePulse - Full-Stack Launcher
echo ====================================================
echo Starting HirePulse Recruitment Intelligence Platform
echo 1. PostgreSQL Database Server (Port 5432)
echo 2. Standalone Express & TypeScript REST API (Port 5000)
echo 3. Next.js 14 Responsive Frontend (Port 3000)
echo ====================================================

start "HirePulse Database (PostgreSQL 5432)" cmd /k "%~dp0start-postgres.bat"
timeout /t 2 /nobreak >nul

start "HirePulse Backend API (Port 5000)" cmd /k "%~dp0run-backend.bat"
timeout /t 2 /nobreak >nul

start "HirePulse Frontend (Port 3000)" cmd /k "%~dp0run-frontend.bat"

echo.
echo All services launched!
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo - PostgreSQL: localhost:5432
pause
