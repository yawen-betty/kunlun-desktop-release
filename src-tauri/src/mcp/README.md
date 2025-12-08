# MCP 模块

Model Context Protocol (MCP) 客户端实现，负责与 MCP Server 通信并管理浏览器自动化工具。

## 模块结构

```
mcp/
├── mod.rs          # 模块导出
├── manager.rs      # 核心管理器（约 90 行）
├── protocol.rs     # JSON-RPC 协议通信
├── browser.rs      # 浏览器管理
├── process.rs      # 进程管理
└── types.rs        # 类型定义
```

## 核心组件

### 1. McpManager (manager.rs)
**职责：** 协调 MCP Server 的启动、通信和生命周期管理

**主要功能：**
- `start()` - 启动 MCP Server
- `stop()` - 停止 MCP Server
- `list_tools()` - 列出可用工具
- `call_tool()` - 调用指定工具
- `check_browser_installed()` - 检查浏览器状态

**依赖：**
- `BrowserManager` - 浏览器检查和安装
- `McpProcess` - 进程启动和管理
- `McpProtocol` - JSON-RPC 通信

### 2. McpProtocol (protocol.rs)
**职责：** 与 MCP Server 进行 JSON-RPC 通信

**主要功能：**
- `initialize()` - 初始化 MCP 客户端
- `send_request()` - 发送请求并等待响应
- `list_tools()` - 获取工具列表
- `call_tool()` - 调用工具

**通信方式：**
- 使用 stdio（标准输入输出）
- JSON-RPC 2.0 协议
- 每行一个 JSON 消息

**协议流程：**
```
1. 发送 initialize 请求
2. 接收 initialize 响应
3. 发送 initialized 通知
4. 开始正常通信（tools/list, tools/call）
```

### 3. BrowserManager (browser.rs)
**职责：** 检查和安装 Playwright 浏览器

**主要功能：**
- `check_installed()` - 检查浏览器是否已安装
- `install()` - 安装浏览器
- `wait_for_installation()` - 等待安装完成

**浏览器路径：**
- macOS: `~/Library/Caches/ms-playwright`
- Windows: `%LOCALAPPDATA%/ms-playwright`
- Linux: `~/.cache/ms-playwright`

**安装方式：**
```bash
npx playwright install chromium
```

### 4. McpProcess (process.rs)
**职责：** 启动和管理 MCP Server 进程

**主要功能：**
- `spawn()` - 启动 MCP Server 进程
- `kill()` - 终止进程

**启动参数：**
```bash
node mcp-entry.cjs --browser chromium
```

**环境变量：**
- `PLAYWRIGHT_BROWSERS_PATH` - 浏览器安装路径

### 5. Types (types.rs)
**职责：** 定义 MCP 模块使用的数据结构

**主要类型：**
- `BrowserStatus` - 浏览器安装状态

## 启动流程

```
1. 调用 start(app)
   ↓
2. 检查浏览器是否已安装
   ├─ 未安装：
   │  ├─ 调用 BrowserManager::install()
   │  └─ 等待安装完成（最多 5 分钟）
   └─ 已安装：继续
   ↓
3. 启动 MCP Server 进程
   ├─ 获取资源目录
   ├─ 设置环境变量
   └─ 执行 node mcp-entry.cjs
   ↓
4. 等待进程启动（2 秒）
   ↓
5. 初始化 MCP 协议
   ├─ 发送 initialize 请求
   └─ 发送 initialized 通知
   ↓
6. 标记为已初始化
```

## 工具调用流程

```
1. 调用 list_tools()
   ├─ 发送 tools/list 请求
   └─ 返回工具列表
   ↓
2. 调用 call_tool(name, args)
   ├─ 发送 tools/call 请求
   ├─ 传递工具名称和参数
   └─ 返回执行结果
```

## 使用示例

```rust
use crate::mcp::McpManager;
use tauri::AppHandle;

// 创建 MCP 管理器
let mut manager = McpManager::new();

// 启动 MCP Server
manager.start(&app).await?;

// 列出可用工具
let tools = manager.list_tools().await?;
println!("可用工具: {:?}", tools);

// 调用工具
let result = manager.call_tool(
    "browser_navigate",
    serde_json::json!({
        "url": "https://www.baidu.com"
    })
).await?;

// 停止 MCP Server
manager.stop()?;
```

## 可用工具

MCP Server 提供以下浏览器自动化工具：

1. **browser_navigate** - 导航到指定 URL
2. **browser_snapshot** - 获取页面快照
3. **browser_click** - 点击页面元素
4. **browser_type** - 在输入框中输入文本
5. **browser_evaluate** - 执行 JavaScript 代码
6. **browser_wait_for** - 等待指定时间

## JSON-RPC 消息格式

### 请求格式
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "browser_navigate",
    "arguments": {
      "url": "https://www.baidu.com"
    }
  },
  "id": 1
}
```

### 响应格式
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "导航成功"
      }
    ]
  },
  "id": 1
}
```

### 错误格式
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request"
  },
  "id": 1
}
```

## 注意事项

1. **浏览器安装**：首次启动会自动安装 Chromium（约 200MB）
2. **进程管理**：确保在应用退出时调用 `stop()` 清理进程
3. **并发限制**：MCP Server 使用 stdio 通信，不支持并发请求
4. **错误处理**：所有错误都会转换为 String 类型返回
5. **日志输出**：使用 eprintln! 输出调试信息

## 故障排查

### 浏览器未安装
```
错误: 浏览器未安装。请先停止 MCP Server，然后重新启动（会自动安装浏览器）。
解决: 停止并重新启动 MCP Server，等待自动安装完成
```

### 进程启动失败
```
错误: Failed to spawn process
解决: 检查 Node.js 是否已安装，检查 mcp-entry.cjs 文件是否存在
```

### 通信超时
```
错误: Failed to read from stdout
解决: 检查 MCP Server 进程是否正常运行，查看 stderr 日志
```

## 扩展性

- **支持其他浏览器**：修改启动参数 `--browser`
- **自定义工具**：在 MCP Server 端添加新工具
- **自定义协议**：扩展 `protocol.rs` 支持更多 MCP 方法
- **进程监控**：添加进程健康检查和自动重启
