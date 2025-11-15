@echo off
REM JARVIS Launcher Script for Windows
REM This script starts both the backend and frontend in development mode

echo Starting JARVIS AI Assistant...
echo ================================

REM Check if virtual environment exists
if not exist "backend\venv" (
    echo Virtual environment not found. Please run setup first.
    echo See SETUP.md for installation instructions.
    exit /b 1
)

REM Check if node_modules exists
if not exist "frontend\node_modules" (
    echo Node modules not found. Please run setup first.
    echo See SETUP.md for installation instructions.
    exit /b 1
)

REM Start backend in new window
echo Starting backend server...
start "JARVIS Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

REM Wait for backend to initialize
timeout /t 3 /nobreak > nul

REM Start frontend in new window
echo Starting frontend...
start "JARVIS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo JARVIS is now running!
echo ================================
echo Access the UI at: http://localhost:5173
echo Close the command windows to stop JARVIS
echo.

pause
