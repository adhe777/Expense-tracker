@echo off
echo =======================================================
echo Stopping Expense Tracker (FinMate) Services
echo =======================================================
echo.

:: Kill process on Port 8085 (Backend)
echo Stopping Backend on port 8085...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8085') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: Kill process on Port 5188 (Frontend)
echo Stopping Frontend on port 5188...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5188') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo =======================================================
echo All services have been stopped.
echo =======================================================
timeout /t 3
