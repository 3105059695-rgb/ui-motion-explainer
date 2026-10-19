@echo off
cd /d "%~dp0"
if not exist node_modules call npm ci
if errorlevel 1 goto failed
call npm run dev
goto end
:failed
echo Dependencies could not be installed. Check Node.js and network access.
pause
:end
