@echo off
title VulnScan Platform Launcher

cd /d "%~dp0"

echo Starting Backend...
start "Backend" cmd /k "call venv\Scripts\activate && cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 5 >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 8 >nul

start http://localhost:5173

exit