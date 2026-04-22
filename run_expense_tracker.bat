@echo off
echo =======================================================
echo Starting Expense Tracker (FinMate) Services
echo =======================================================
echo.

:: Start Backend on Port 8085
echo [1/2] Starting Node.js Backend...
start "Expense Backend (8085)" /MIN cmd /k "cd backend && npm run dev"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend on Port 5188
echo [2/2] Starting React Frontend...
start "Expense Frontend (5188)" /MIN cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo All services have been launched!
echo Access the app at: http://localhost:5188
echo =======================================================
timeout /t 5
