@echo off
REM MCP 模块安装脚本 (Windows)
REM 用于在首次克隆项目或 mcp-modules 被删除后重新安装依赖

setlocal

set "SCRIPT_DIR=%~dp0"
set "MCP_DIR=%SCRIPT_DIR%mcp-modules"

echo === 安装 MCP 模块 ===

REM 检查是否已安装
if exist "%MCP_DIR%\node_modules" (
  echo ✅ MCP 模块已安装
  exit /b 0
)

REM 创建目录
if not exist "%MCP_DIR%" mkdir "%MCP_DIR%"

REM 创建 package.json（如果不存在）
if not exist "%MCP_DIR%\package.json" (
  echo 创建 package.json...
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

REM 安装依赖
echo 安装 npm 依赖...
cd /d "%MCP_DIR%"
call npm install

REM 安装 Playwright 浏览器
echo 安装 Playwright 浏览器...
set "PLAYWRIGHT_BROWSERS_PATH=%MCP_DIR%\.playwright-browsers"
call npx playwright install chromium

echo ✅ MCP 模块安装完成
