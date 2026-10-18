@echo off
echo ====================================================
echo Starting HirePulse PostgreSQL 18 Database Server...
echo ====================================================
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "D:\My Project\NZTech\postgres_data" -l "D:\My Project\NZTech\postgres_data\server.log" start
echo PostgreSQL server started on port 5432.
pause
