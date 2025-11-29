#!/bin/bash

set -e

echo "🚀 构建 Playwright MCP Sidecar (Node.js + 源码)..."

BINARIES_DIR="src-tauri/binaries"
mkdir -p "$BINARIES_DIR"

# Node.js 版本
NODE_VERSION="20.11.0"

echo "📥 下载 Node.js 二进制..."

# macOS ARM64
echo "下载 macOS ARM64..."
curl -L "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-arm64.tar.gz" -o node-arm64.tar.gz
tar -xzf node-arm64.tar.gz
mv node-v${NODE_VERSION}-darwin-arm64/bin/node "$BINARIES_DIR/node-aarch64-apple-darwin"
rm -rf node-v${NODE_VERSION}-darwin-arm64 node-arm64.tar.gz

# macOS x64
echo "下载 macOS x64..."
curl -L "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-x64.tar.gz" -o node-x64.tar.gz
tar -xzf node-x64.tar.gz
mv node-v${NODE_VERSION}-darwin-x64/bin/node "$BINARIES_DIR/node-x86_64-apple-darwin"
rm -rf node-v${NODE_VERSION}-darwin-x64 node-x64.tar.gz

# Linux x64
echo "下载 Linux x64..."
curl -L "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" -o node-linux.tar.gz
tar -xzf node-linux.tar.gz
mv node-v${NODE_VERSION}-linux-x64/bin/node "$BINARIES_DIR/node-x86_64-unknown-linux-gnu"
rm -rf node-v${NODE_VERSION}-linux-x64 node-linux.tar.gz

# Windows x64
echo "下载 Windows x64..."
curl -L "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-x64.zip" -o node-win.zip
unzip -q node-win.zip
mv node-v${NODE_VERSION}-win-x64/node.exe "$BINARIES_DIR/node-x86_64-pc-windows-msvc.exe"
rm -rf node-v${NODE_VERSION}-win-x64 node-win.zip

echo "📦 安装 Playwright MCP..."
MCP_DIR="$BINARIES_DIR/mcp-modules"
mkdir -p "$MCP_DIR"
cd "$MCP_DIR"
npm init -y
npm install @playwright/mcp@latest
cd ../../..

echo "📝 创建启动脚本..."
cat > "$BINARIES_DIR/mcp-entry.cjs" << 'EOF'
#!/usr/bin/env node
const path = require('path');
const modulePath = path.join(__dirname, 'mcp-modules', 'node_modules', '@playwright', 'mcp', 'cli.js');
require(modulePath);
EOF

chmod +x "$BINARIES_DIR"/node-*
chmod +x "$BINARIES_DIR/mcp-entry.cjs"

echo "✅ 构建完成！"
echo ""
echo "生成的文件："
ls -lh "$BINARIES_DIR"/node-*
echo ""
echo "📂 结构："
echo "binaries/"
echo "├── node-aarch64-apple-darwin      (Node.js)"
echo "├── node-x86_64-apple-darwin       (Node.js)"
echo "├── node-x86_64-unknown-linux-gnu  (Node.js)"
echo "├── node-x86_64-pc-windows-msvc.exe (Node.js)"
echo "├── mcp-entry.js                   (启动脚本)"
echo "└── mcp-modules/                   (Playwright MCP)"
