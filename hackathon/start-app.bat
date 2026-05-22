@echo off
echo Starting Swasth AI Medical Platform...
echo.

REM Kill any existing Node.js processes
taskkill /f /im node.exe >nul 2>&1

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d \"c:\Users\gouri\OneDrive\Desktop\swasth 1\hackathon\server\" && npm start"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd /d \"c:\Users\gouri\OneDrive\Desktop\swasth 1\hackathon\" && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3333
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul