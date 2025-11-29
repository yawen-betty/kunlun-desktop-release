# AI 模块

AI Agent 核心实现，负责与大语言模型交互并调用 MCP 工具完成任务。

## 模块结构

```
ai/
├── mod.rs              # 模块导出
├── manager.rs          # 核心管理器（约 280 行）
├── api_client.rs       # API 调用客户端
├── tool_executor.rs    # 工具执行器
├── message_builder.rs  # 消息构建器
├── config.rs           # 配置结构
└── types.rs            # 类型定义
```

## 核心组件

### 1. AIManager (manager.rs)
**职责：** 协调 AI 和 MCP 的交互，实现 AI Agent 的核心逻辑

**主要功能：**
- `execute_task()` - 执行 AI 任务（简化接口）
- `execute_task_with_config()` - 执行 AI 任务（完整配置）
- 管理任务执行流程和并发控制
- 协调 API 调用和工具执行
- 处理对话循环和状态管理

**依赖：**
- `ApiClient` - 调用 AI API
- `ToolExecutor` - 执行 MCP 工具
- `MessageBuilder` - 构建对话消息
- `McpManager` - 获取工具列表和浏览器状态

### 2. ApiClient (api_client.rs)
**职责：** 与 AI 服务（智谱 AI）进行 HTTP 通信

**主要功能：**
- `call_api()` - 调用 AI API 并返回响应
- 支持重试机制（限流处理）
- 超时控制（60秒）
- 错误处理和日志记录

**特性：**
- 自动重试（最多 3 次）
- 限流检测（错误码 1305）
- 指数退避策略（2秒、4秒、6秒）

### 3. ToolExecutor (tool_executor.rs)
**职责：** 执行 AI 请求的工具调用

**主要功能：**
- `execute_tools()` - 批量执行工具调用
- 解析工具参数
- 调用 MCP 工具
- 处理工具执行结果和错误

**错误处理：**
- 参数解析失败
- MCP 协议层错误
- 工具执行异常

### 4. MessageBuilder (message_builder.rs)
**职责：** 构建符合 AI API 格式的对话消息

**主要功能：**
- `new()` - 创建构建器
- `with_system_prompt()` - 添加系统提示词
- `with_user_message()` - 添加用户消息
- `build()` - 生成消息列表

**消息格式：**
- 系统消息（可选）
- 用户消息
- 助手消息（带工具调用）
- 工具结果消息

### 5. AITaskConfig (config.rs)
**职责：** 配置 AI 任务的执行参数

**配置项：**
- `api_key` - API 密钥
- `api_url` - API 地址（默认：智谱 AI）
- `max_iterations` - 最大迭代次数（默认：10）
- `timeout_secs` - 超时时间（默认：600秒）
- `system_prompt` - 系统提示词（可选）

**构建方法：**
- `new(api_key)` - 使用默认配置
- `with_api_url()` - 自定义 API 地址
- `with_max_iterations()` - 自定义迭代次数
- `with_system_prompt()` - 自定义系统提示词

### 6. Types (types.rs)
**职责：** 定义 AI 模块使用的数据结构

**主要类型：**
- `TaskResult` - 任务执行结果
- `Message` - 对话消息
- `ToolCall` - 工具调用
- `Tool` - 工具定义
- `ZhipuResponse` - 智谱 API 响应
- `ToolResult` - 工具执行结果

## 执行流程

```
1. 用户调用 execute_task(api_key, task)
   ↓
2. 获取任务锁（防止并发）
   ↓
3. 检查浏览器状态
   ↓
4. 获取 MCP 工具列表
   ↓
5. 构建初始消息（系统提示词 + 用户任务）
   ↓
6. 进入对话循环：
   ├─ 调用 AI API
   ├─ 如果 AI 请求工具调用：
   │  ├─ 执行工具
   │  ├─ 将结果添加到对话历史
   │  └─ 继续循环
   └─ 如果 AI 返回最终答案：
      └─ 返回任务结果
```

## 使用示例

```rust
use crate::ai::AIManager;
use crate::mcp::McpManager;
use std::sync::Arc;
use tokio::sync::Mutex;

// 创建 AI 管理器
let mcp_manager = Arc::new(Mutex::new(McpManager::new()));
let ai_manager = AIManager::new(mcp_manager);

// 执行任务
let result = ai_manager.execute_task(
    "your-api-key".to_string(),
    "打开百度并搜索 Rust 编程".to_string()
).await?;

println!("任务结果: {}", result.message);
println!("工具调用次数: {}", result.tool_calls_count);
```

## 配置示例

```rust
use crate::ai::{AIManager, AITaskConfig};

let config = AITaskConfig::new("your-api-key".to_string())
    .with_max_iterations(20)
    .with_system_prompt("你是一个专业的浏览器自动化助手".to_string());

let result = ai_manager.execute_task_with_config(
    "执行复杂任务".to_string(),
    config
).await?;
```

## 注意事项

1. **并发控制**：同一时间只能执行一个任务
2. **超时设置**：默认 10 分钟，可通过配置调整
3. **迭代限制**：默认最多 10 轮对话，防止无限循环
4. **错误处理**：所有错误都会转换为 String 类型返回
5. **日志输出**：使用 eprintln! 输出调试信息

## 扩展性

- **支持其他 AI 服务**：修改 `api_client.rs` 中的 API 调用逻辑
- **自定义工具**：通过 MCP 协议添加新工具
- **自定义提示词**：使用 `system_prompt` 配置
- **调整超时和重试**：修改 `config.rs` 中的默认值
