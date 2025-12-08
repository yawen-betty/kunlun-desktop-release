use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::sync::Mutex;
use tokio::time::{timeout, Duration};
use tauri::AppHandle;
use crate::mcp::McpManager;
use crate::mcp::browser::BrowserManager;
use super::types::*;
use super::config::AITaskConfig;
use super::api_client::ApiClient;
use super::tool_executor::ToolExecutor;
use super::message_builder::MessageBuilder;

/// AI 任务管理器
///
/// 负责协调 AI 和 MCP 的交互，实现 AI Agent 的核心逻辑
///
/// # 职责
/// - 管理任务执行流程
/// - 协调 AI API 调用和工具执行
/// - 处理对话循环和状态管理
/// - 确保任务的并发安全
pub struct AIManager {
    /// 任务锁，确保同一时间只执行一个任务
    /// 使用 Arc<Mutex<()>> 作为信号量
    task_lock: Arc<Mutex<()>>,

    /// 任务取消标志
    /// 用于强制停止正在执行的任务
    cancel_flag: Arc<AtomicBool>,

    /// MCP 管理器的共享引用
    /// 用于调用浏览器自动化工具
    mcp_manager: Arc<Mutex<McpManager>>,

    /// API 客户端，负责与 AI 服务通信
    api_client: ApiClient,

    /// 工具执行器，负责执行 AI 请求的工具调用
    tool_executor: ToolExecutor,
}

impl AIManager {
    /// 创建新的 AI 管理器
    ///
    /// # 参数
    /// * `mcp_manager` - MCP 管理器的共享引用
    pub fn new(mcp_manager: Arc<Mutex<McpManager>>) -> Self {
        Self {
            task_lock: Arc::new(Mutex::new(())),
            cancel_flag: Arc::new(AtomicBool::new(false)),
            tool_executor: ToolExecutor::new(Arc::clone(&mcp_manager)),
            mcp_manager,
            api_client: ApiClient::new(),
        }
    }

    /// 强制停止当前正在执行的任务
    ///
    /// # 说明
    /// 设置取消标志，任务会在下一次检查点停止执行
    /// 不会立即中断，而是在对话循环的下一轮检查时退出
    pub fn stop_task(&self) {
        eprintln!("[AI] 收到停止任务请求");
        self.cancel_flag.store(true, Ordering::SeqCst);
    }

    /// 执行 AI 任务（带配置）
    ///
    /// # 参数
    /// * `task` - 任务描述
    /// * `config` - 任务配置（API Key、URL、超时等）
    /// * `app` - AppHandle 用于检查浏览器
    ///
    /// # 返回
    /// 任务执行结果，包含成功状态、消息和统计信息
    ///
    /// # 超时
    /// 任务会在 config.timeout_secs 秒后超时
    pub async fn execute_task_with_config(
        &self,
        task: String,
        config: AITaskConfig,
        app: &AppHandle,
    ) -> Result<TaskResult, String> {
        timeout(Duration::from_secs(config.timeout_secs), async {
            self.execute_task_internal(task, config, app).await
        })
        .await
        .map_err(|_| "任务执行超时".to_string())?
    }

    /// 执行 AI 任务（简化接口，向后兼容）
    ///
    /// # 参数
    /// * `api_key` - API 密钥
    /// * `task` - 任务描述
    /// * `app` - AppHandle 用于检查浏览器
    pub async fn execute_task(
        &self,
        api_key: String,
        task: String,
        app: &AppHandle,
    ) -> Result<TaskResult, String> {
        let config = AITaskConfig::new(api_key);
        self.execute_task_with_config(task, config, app).await
    }

    /// 任务执行的内部实现
    ///
    /// # 流程
    /// 1. 获取任务锁（防止并发）
    /// 2. 检查浏览器状态
    /// 3. 获取 MCP 工具列表
    /// 4. 构建初始消息
    /// 5. 执行对话循环
    async fn execute_task_internal(
        &self,
        task: String,
        config: AITaskConfig,
        app: &AppHandle,
    ) -> Result<TaskResult, String> {
        // 获取任务锁，确保同一时间只执行一个任务
        let _lock = self.task_lock.lock().await;

        // 重置取消标志
        self.cancel_flag.store(false, Ordering::SeqCst);

        eprintln!("[AI] 开始执行任务: {}", task);

        // 检查浏览器是否已安装
        self.check_browser_status(app).await?;

        // 获取 MCP 工具列表
        let tools = self.get_mcp_tools().await?;
        eprintln!("[AI] 加载了 {} 个 MCP 工具", tools.len());

        // 构建初始消息列表
        let mut messages = MessageBuilder::new()
            .with_system_prompt(config.system_prompt.clone())
            .with_user_message(task)
            .build();

        // 执行对话循环
        self.run_conversation_loop(&config, &mut messages, &tools).await
    }

    /// 检查浏览器状态
    ///
    /// # 错误
    /// 如果浏览器未安装，返回错误提示
    async fn check_browser_status(&self, app: &AppHandle) -> Result<(), String> {
        eprintln!("[AI] 检查浏览器状态...");

        let browser_status = BrowserManager::check_installed(app);

        if !browser_status.installed {
            eprintln!("[AI] 浏览器未安装，任务终止");
            return Err("浏览器未安装。请先停止 MCP Server，然后重新启动（会自动安装浏览器）。".to_string());
        }

        eprintln!("[AI] 浏览器已安装");
        Ok(())
    }

    /// 获取并转换 MCP 工具列表
    ///
    /// # 返回
    /// 转换为 AI API 格式的工具列表（仅白名单工具）
    async fn get_mcp_tools(&self) -> Result<Vec<Tool>, String> {
        let mut mcp = self.mcp_manager.lock().await;
        let tools_response = mcp.list_tools().await?;
        drop(mcp);

        // 定义允许的工具白名单
        let allowed_tools = vec![
            "browser_snapshot",        // 获取页面可访问性快照
            "browser_click",           // 点击元素
            "browser_type",            // 输入文本
            "browser_evaluate",        // 执行JavaScript（数据提取）
            "browser_hover",           // 鼠标悬停
//             "browser_select_option",   // 选择下拉选项
//             "browser_press_key",       // 按键盘按键
            "browser_wait_for",        // 等待
//             "browser_take_screenshot", // 截图
            "browser_close",           // 关闭浏览器
            "browser_tabs",            // 管理标签
            "browser_handle_dialog",   // 处理弹窗
            "browser_console_messages", // 获取控制台日志
        ];

        // 解析 MCP 返回的工具列表
        let tools_array = tools_response
            .get("tools")
            .and_then(|t| t.as_array())
            .ok_or("无法获取工具列表")?;

        // 转换为 AI API 格式（仅白名单工具）
        let mut tools = Vec::new();
        for tool in tools_array {
            if let Some(name) = tool.get("name").and_then(|n| n.as_str()) {
                // 白名单过滤
                if !allowed_tools.contains(&name) {
                    continue;
                }

                let description = tool
                    .get("description")
                    .and_then(|d| d.as_str())
                    .unwrap_or("");

                let input_schema = tool
                    .get("inputSchema")
                    .cloned()
                    .unwrap_or(serde_json::json!({
                        "type": "object",
                        "properties": {}
                    }));

                tools.push(Tool {
                    tool_type: "function".to_string(),
                    function: FunctionDef {
                        name: name.to_string(),
                        description: description.to_string(),
                        parameters: input_schema,
                    },
                });
            }
        }

        eprintln!("[AI] 加载了 {} 个工具（白名单过滤）", tools.len());
        Ok(tools)
    }

    /// 执行对话循环
    ///
    /// # 参数
    /// * `config` - 任务配置
    /// * `messages` - 对话历史（可变，会不断添加新消息）
    /// * `tools` - 可用的工具列表
    ///
    /// # 流程
    /// 1. 调用 AI API 获取响应
    /// 2. 如果 AI 请求工具调用：
    ///    - 执行工具
    ///    - 将结果添加到对话历史
    ///    - 继续循环
    /// 3. 如果 AI 返回最终答案：
    ///    - 返回任务结果
    ///
    /// # 限制
    /// 最多执行 config.max_iterations 轮对话
    async fn run_conversation_loop(
        &self,
        config: &AITaskConfig,
        messages: &mut Vec<Message>,
        tools: &[Tool],
    ) -> Result<TaskResult, String> {
        let mut iteration = 0;

        loop {
            // 检查是否收到取消请求
            if self.cancel_flag.load(Ordering::SeqCst) {
                eprintln!("[AI] 任务被用户取消");
                return Err("任务已被用户取消".to_string());
            }

            iteration += 1;
            eprintln!("[AI] 第 {} 轮对话", iteration);

            // 检查是否超过最大迭代次数
            if iteration > config.max_iterations {
                return Err(format!("超过最大迭代次数 {}", config.max_iterations));
            }

            // 每轮请求间隔 1 秒，避免请求过快
            if iteration > 1 {
                tokio::time::sleep(Duration::from_secs(1)).await;
            }

            // 调用 AI API
            let response = self.api_client
                .call_api(
                    &config.api_url,
                    &config.api_key,
                    &config.model,
                    messages.clone(),
                    tools.to_vec(),
                    config.enable_thinking,
                )
                .await?;

            // 检查 AI 是否请求工具调用
            if let Some(tool_calls) = response.tool_calls {
                eprintln!("[AI] 需要调用 {} 个工具", tool_calls.len());

                // 添加 AI 的响应到对话历史
                messages.push(Message {
                    role: "assistant".to_string(),
                    content: response.content,
                    tool_calls: Some(tool_calls.clone()),
                    tool_call_id: None,
                    name: None,
                });

                // 执行工具调用
                let tool_results = self.tool_executor
                    .execute_tools(tool_calls)
                    .await?;

                // 将工具执行结果添加到对话历史
                for result in tool_results {
                    messages.push(Message {
                        role: "tool".to_string(),
                        content: Some(result.content),
                        tool_calls: None,
                        tool_call_id: Some(result.call_id),
                        name: Some(result.name),
                    });
                }
            } else {
                // AI 返回最终答案，任务完成
                eprintln!("[AI] 任务完成，共 {} 轮对话", iteration);
                return Ok(TaskResult {
                    success: true,
                    message: response.content.unwrap_or_default(),
                    data: None,
                    tool_calls_count: iteration - 1,
                });
            }
        }
    }
}
