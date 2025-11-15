#!/bin/bash

# JARVIS Launcher Script
# This script starts both the backend and frontend in development mode

echo "Starting JARVIS AI Assistant..."
echo "================================"

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Virtual environment not found. Please run setup first."
    echo "See SETUP.md for installation instructions."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "Node modules not found. Please run setup first."
    echo "See SETUP.md for installation instructions."
    exit 1
fi

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to initialize
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "JARVIS is now running!"
echo "================================"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Access the UI at: http://localhost:5173"
echo "Press Ctrl+C to stop JARVIS"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
