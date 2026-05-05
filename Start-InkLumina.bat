@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not available in PATH.
  echo Please install Node.js LTS first, then double-click this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not available in PATH.
  echo Please reinstall Node.js LTS, then double-click this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies for InkLumina...
  call npm install
  if errorlevel 1 goto :fail
)

start "InkLumina Browser" cmd /c "timeout /t 10 >nul && start \"\" http://127.0.0.1:4173/display"

echo Starting InkLumina on http://127.0.0.1:4173/display
call npm run release:localhost
if errorlevel 1 goto :fail
exit /b 0

:fail
echo.
echo InkLumina failed to start.
pause
exit /b 1