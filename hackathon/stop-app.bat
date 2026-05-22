@echo off
echo Stopping all Swasth AI services...

REM Kill all Node.js processes
taskkill /f /im node.exe >nul 2>&1

REM Kill any processes using common ports
netstat -ano | findstr :3333 >nul && (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3333') do taskkill /f /pid %%a >nul 2>&1
)

netstat -ano | findstr :5173 >nul && (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
)

netstat -ano | findstr :8080 >nul && (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /f /pid %%a >nul 2>&1
)

echo All services stopped.
pause