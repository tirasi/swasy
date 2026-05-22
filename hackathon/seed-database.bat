@echo off
echo ========================================
echo    SEEDING FIRESTORE DATABASE
echo ========================================
echo.

cd server
echo Starting Firestore database seeding...
node scripts/seed-firebase.js

echo.
echo ========================================
echo    SEEDING COMPLETE
echo ========================================
pause