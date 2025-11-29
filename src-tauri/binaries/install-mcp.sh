#!/bin/bash

# MCP 模块安装脚本
# 用于在首次克隆项目或 mcp-modules 被删除后重新安装依赖

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_DIR="$SCRIPT_DIR/mcp-modules"

echo "=== 安装 MCP 模块 ==="

# 检查是否已安装
if [ -d "$MCP_DIR/node_modules" ]; then
  echo "✅ MCP 模块已安装"
  exit 0
fi

# 创建目录
mkdir -p "$MCP_DIR"

# 复制 package.json（如果不存在）
if [ ! -f "$MCP_DIR/package.json" ]; then
  echo "创建 package.json..."
  cat > "$MCP_DIR/package.json" << 'EOF'
{
  "name": "mcp-modules",
  "version": "1.0.0",
  "description": "Playwright MCP modules for Kunlun Desktop",
  "dependencies": {
    "@playwright/mcp": "0.0.47"
  }
}
EOF
fi

# 安装依赖
echo "安装 npm 依赖..."
cd "$MCP_DIR"
npm install

# 安装 Playwright 浏览器
echo "安装 Playwright 浏览器..."
export PLAYWRIGHT_BROWSERS_PATH="$MCP_DIR/.playwright-browsers"
npx playwright install chromium

echo "✅ MCP 模块安装完成"
