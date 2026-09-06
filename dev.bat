@echo off
echo Starting MD Blog development environment...
echo.

echo [1/2] Starting backend server...
start "Backend Server" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo All services started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:7001
echo.
