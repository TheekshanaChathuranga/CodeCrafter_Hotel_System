@echo off
echo ============================================
echo    API Connection Test & Fix Script
echo ============================================
echo.

echo Testing API endpoints...
echo.

echo [1/4] Testing health endpoint...
curl -s http://localhost:5000/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Health endpoint: WORKING
) else (
    echo ❌ Health endpoint: FAILED
    echo Server might not be running!
    goto :server_not_running
)

echo [2/4] Testing reception bookings endpoint...
curl -s http://localhost:5000/api/receptionBookings > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Reception Bookings endpoint: WORKING
) else (
    echo ❌ Reception Bookings endpoint: FAILED
)

echo [3/4] Testing alternative bookings endpoint...
curl -s http://localhost:5000/api/bookings > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Alternative Bookings endpoint: WORKING
) else (
    echo ❌ Alternative Bookings endpoint: FAILED
)

echo [4/4] Testing dashboard stats endpoint...
curl -s http://localhost:5000/api/dashboard/stats > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Dashboard Stats endpoint: WORKING
) else (
    echo ❌ Dashboard Stats endpoint: FAILED
)

echo.
echo ============================================
echo All tests completed!
echo.
echo If any endpoints failed, try:
echo 1. Restart the backend server
echo 2. Check MongoDB connection
echo 3. Clear browser cache and refresh
echo ============================================
pause
exit /b 0

:server_not_running
echo.
echo ============================================
echo Backend server is not running!
echo.
echo Starting backend server now...
echo ============================================
cd /d "%~dp0Backend"
npm start
pause
exit /b 1
