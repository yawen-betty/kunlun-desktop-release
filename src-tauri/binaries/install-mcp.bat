@echo off
REM MCP modules installation script for Windows

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "MCP_DIR=%SCRIPT_DIR%mcp-modules"

echo === Installing MCP Modules ===

REM Check if already installed
if exist "%MCP_DIR%\node_modules" (
  echo [OK] MCP modules already installed
  exit /b 0
)

REM Create directory
if not exist "%MCP_DIR%" (
  echo Creating directory: %MCP_DIR%
  mkdir "%MCP_DIR%"
)

REM Create package.json if not exists
if not exist "%MCP_DIR%\package.json" (
  echo Creating package.json...
  (
    echo {
    echo   "name": "mcp-modules",
    echo   "version": "1.0.0",
    echo   "description": "Playwright MCP modules for Kunlun Desktop",
    echo   "dependencies": {
    echo     "@playwright/mcp": "0.0.47"
    echo   }
    echo }
  ) > "%MCP_DIR%\package.json"
)

REM Install dependencies
echo Installing npm dependencies...
cd /d "%MCP_DIR%" || (
  echo [ERROR] Cannot change to directory: %MCP_DIR%
  exit /b 1
)

call npm install
if errorlevel 1 (
  echo [ERROR] npm install failed
  exit /b 1
)

REM Install Playwright browsers
echo Installing Playwright browsers...
set "PLAYWRIGHT_BROWSERS_PATH=%MCP_DIR%\.playwright-browsers"
call npx playwright install chromium
if errorlevel 1 (
  echo [ERROR] Playwright browser installation failed
  exit /b 1
)

echo [OK] MCP modules installation completed
exit /b 0
