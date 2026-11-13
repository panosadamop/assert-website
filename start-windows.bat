@echo off
REM ASSERT – start website + CMS locally on Windows (double-click this file).
title ASSERT dev
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed. Download the LTS version from https://nodejs.org and run this file again.
  echo.
  pause
  exit /b 1
)
if not exist "backend\node_modules" node scripts\setup.js || goto :error
if not exist "frontend\node_modules" node scripts\setup.js || goto :error
start "" /b cmd /c "timeout /t 12 >nul & start http://localhost:3100 & start http://localhost:4000/admin"
node scripts\dev.js
goto :eof
:error
echo.
echo  Setup failed – see the messages above.
pause
