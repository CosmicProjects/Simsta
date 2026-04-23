@echo off
title Simsta - Social Media Simulation Game
color 0F

:: icon path
set "ICON_PATH=%~dp0icon\icon.ico"

echo.
echo  ████████████████████████████████████████████████████████████████████████████
echo  █                                                                          █
echo  █                    💕 Simsta - Social Media Game                        █
echo  █                                                                          █
echo  ████████████████████████████████████████████████████████████████████████████
echo.

:: ============================================================================
:: 💕 Simsta - Social Media Simulation Game - LAUNCHER
:: ============================================================================

:: Check if HTML file exists
if not exist "index.html" (
    echo ❌ ERROR: index.html not found!
    echo    Make sure this launcher is in the same folder as index.html.
    pause
    exit /b 1
)

echo 🔍 Detecting browser...

:: Find best browser
set "BROWSER="
set "BROWSER_FOUND=0"

where chrome >nul 2>&1
if %errorlevel% equ 0 (
    set "BROWSER=chrome"
    set "BROWSER_FOUND=1"
    goto :launch
)

where msedge >nul 2>&1
if %errorlevel% equ 0 (
    set "BROWSER=msedge"
    set "BROWSER_FOUND=1"
    goto :launch
)

where firefox >nul 2>&1
if %errorlevel% equ 0 (
    set "BROWSER=firefox"
    set "BROWSER_FOUND=1"
    goto :launch
)

echo ❌ No browser found! Install Chrome, Edge, or Firefox.
pause
exit /b 1

:launch
echo ✅ Browser detected: %BROWSER%
echo 🚀 Launching Simsta - Social Media Simulation Game...
echo.

:: Open the game in browser
start "" %BROWSER% --app="file:///%CD%/index.html"

:: Close the console window after launching
timeout /t 2 /nobreak >nul
exit