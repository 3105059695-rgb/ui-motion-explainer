@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (echo Python 3.10+ is required. Ask your agent to read AI-START.md.& pause& exit /b 1)
python -B -X utf8 install.py %*
pause
