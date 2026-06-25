@echo off
echo ==========================================
echo  LeetCode Progress Analyzer - Backend
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/2] Seeding database with curated problems...
python seed_data.py
echo.

echo [2/2] Starting FastAPI server on http://localhost:8000
echo        API docs: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
