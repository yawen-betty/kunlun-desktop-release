#!/usr/bin/env node
const path = require('path');

// 设置 Playwright 浏览器路径
const browsersPath = path.join(__dirname, 'mcp-modules', '.playwright-browsers');
process.env.PLAYWRIGHT_BROWSERS_PATH = browsersPath;

// 设置 Playwright 配置
process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '0';
process.env.PLAYWRIGHT_CHROMIUM_USE_HEADLESS_NEW = '1';

// 添加 Chrome 启动参数（启用 CDP）
process.env.PLAYWRIGHT_CHROMIUM_ARGS = '--remote-debugging-port=9222';

console.error('[MCP Entry] PLAYWRIGHT_BROWSERS_PATH:', browsersPath);
console.error('[MCP Entry] CDP port: 9222');

const modulePath = path.join(__dirname, 'mcp-modules', 'node_modules', '@playwright', 'mcp', 'cli.js');
require(modulePath);
