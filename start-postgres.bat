@echo off
title PostgreSQL 18 Server (HirePulse Port 5432)
echo ====================================================
echo Starting HirePulse PostgreSQL 18 Database Server...
echo Host: localhost ^| Port: 5432 ^| Database: hirepulse_db
echo ====================================================
echo Keeping PostgreSQL running in this window. Do not close while testing.
echo.
"C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "D:\My Project\NZTech\postgres_data"
pause
