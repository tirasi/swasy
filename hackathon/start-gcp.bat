@echo off
echo Starting Swasth AI with GCP Backend...
echo.

echo Starting Backend (Port 8080)...
start cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend (Port 5173)...
start cmd /k "npm run dev"

echo.
echo ✅ Both servers starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause
