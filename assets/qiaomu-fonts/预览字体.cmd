@echo off
cd /d "%~dp0"
python -X utf8 preview.py
if errorlevel 1 pause
