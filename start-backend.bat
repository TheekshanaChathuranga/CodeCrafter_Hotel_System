@echo off
echo Checking Backend Server Status...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version

REM Navigate to backend directory
cd /d "%~dp0Backend"
if %errorlevel% neq 0 (
    echo ERROR: Backend directory not found
    pause
    exit /b 1
)

echo.
echo Checking if package.json exists...
if not exist package.json (
    echo ERROR: package.json not found in Backend directory
    pause
    exit /b 1
)

echo package.json found
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed
)

echo.
echo Starting Backend Server...
echo Server will run on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

REM Start the server
npm start

pause
