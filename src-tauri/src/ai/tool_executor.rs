use std::sync::Arc;
use tokio::sync::Mutex;
use crate::mcp::McpManager;
use super::types::{ToolCall, ToolResult};

/// 工具执行器
/// 
/// 负责执行 AI 请求的工具调用，并收集执行结果
pub struct ToolExecutor {
    /// MCP 管理器的共享引用
    /// 用于调用浏览器自动化工具
    mcp_manager: Arc<Mutex<McpManager>>,
}

impl ToolExecutor {
    /// 创建新的工具执行器
    /// 
    /// # 参数
    /// * `mcp_manager` - MCP 管理器的共享引用
    pub fn new(mcp_manager: Arc<Mutex<McpManager>>) -> Self {
        Self { mcp_manager }
    }
    
    /// 执行工具调用列表
    /// 
    /// # 参数
    /// * `tool_calls` - AI 请求的工具调用列表
    /// 
    /// # 返回
    /// 工具执行结果列表，每个结果对应一个工具调用
    /// 
    /// # 错误处理
    /// - 参数解析失败：返回错误
    /// - 工具执行失败：将错误信息包装在结果中返回给 AI
    /// - MCP 协议错误：检查 isError 标志，提取错误信息
    pub async fn execute_tools(
        &self,
        tool_calls: Vec<ToolCall>,
    ) -> Result<Vec<ToolResult>, String> {
        let mut results = Vec::new();

        for tool_call in tool_calls {
            let tool_name = &tool_call.function.name;
            let args_str = &tool_call.function.arguments;

            eprintln!("[Tool] 执行工具: {} 参数: {}", tool_name, args_str);

            // 解析工具参数
            let args: serde_json::Value = serde_json::from_str(args_str)
                .map_err(|e| format!("参数解析失败: {}", e))?;

            // 调用 MCP 工具
            let mut mcp = self.mcp_manager.lock().await;
            let result = mcp.call_tool(tool_name, args).await;

            // 处理执行结果
            match result {
                Ok(data) => {
                    // 检查 MCP 协议层面的错误标志
                    if let Some(is_error) = data.get("isError").and_then(|v| v.as_bool()) {
                        if is_error {
                            // 提取错误信息
                            let error_msg = self.extract_error_message(&data);
                            eprintln!("[Tool] 工具执行失败: {} - {}", tool_name, error_msg);
                            
                            // 将错误信息返回给 AI
                            results.push(ToolResult {
                                call_id: tool_call.id.clone(),
                                name: tool_name.clone(),
                                content: format!("Error: {}", error_msg),
                            });
                            
                            // 释放锁
                            drop(mcp);
                            continue;
                        }
                    }
                    
                    // 工具执行成功
                    eprintln!("[Tool] 工具执行成功: {}", tool_name);
                    results.push(ToolResult {
                        call_id: tool_call.id.clone(),
                        name: tool_name.clone(),
                        content: serde_json::to_string(&data).unwrap(),
                    });
                    
                    // 如果是 browser_click，检查是否需要自动快照
                    // 已禁用：避免每次页面变化都自动快照
                    // if tool_name == "browser_click" {
                    //     // 检查返回的快照是否包含 <changed> 标记
                    //     let has_changes = data.get("content")
                    //         .and_then(|c| c.as_array())
                    //         .and_then(|arr| arr.first())
                    //         .and_then(|item| item.get("text"))
                    //         .and_then(|t| t.as_str())
                    //         .map(|text| text.contains("<changed>"))
                    //         .unwrap_or(false);
                    //     
                    //     if has_changes {
                    //         eprintln!("[Tool] 检测到页面变化，自动获取完整快照");
                    //         
                    //         let snapshot_result = mcp.call_tool(
                    //             "browser_snapshot",
                    //             serde_json::json!({})
                    //         ).await;
                    //         
                    //         match snapshot_result {
                    //             Ok(snapshot_data) => {
                    //                 eprintln!("[Tool] 自动快照成功");
                    //                 results.push(ToolResult {
                    //                     call_id: format!("{}_auto_snapshot", tool_call.id),
                    //                     name: "browser_snapshot".to_string(),
                    //                     content: serde_json::to_string(&snapshot_data).unwrap(),
                    //                 });
                    //             }
                    //             Err(e) => {
                    //                 eprintln!("[Tool] 自动快照失败: {}", e);
                    //             }
                    //         }
                    //     }
                    // }
                    
                    // 释放锁
                    drop(mcp);
                }
                Err(e) => {
                    // Rust 层面的错误（网络错误、超时等）
                    eprintln!("[Tool] 工具执行失败: {} - {}", tool_name, e);
                    results.push(ToolResult {
                        call_id: tool_call.id.clone(),
                        name: tool_name.clone(),
                        content: format!("Error: {}", e),
                    });
                    
                    // 释放锁
                    drop(mcp);
                }
            }
        }

        Ok(results)
    }
    
    /// 判断工具是否会改变页面状态
    /// 
    /// # 参数
    /// * `tool_name` - 工具名称
    /// 
    /// # 返回
    /// 如果工具会改变页面，返回 true
    #[allow(dead_code)]
    fn is_page_changing_tool(&self, tool_name: &str) -> bool {
        matches!(
            tool_name,
            "browser_click" | "browser_type" | "browser_navigate" | 
            "browser_navigate_back" | "browser_select_option" |
            "browser_fill_form" | "browser_press_key"
        )
    }
    
    /// 从 MCP 响应中提取错误信息
    /// 
    /// # 参数
    /// * `data` - MCP 返回的数据
    /// 
    /// # 返回
    /// 错误信息字符串
    fn extract_error_message(&self, data: &serde_json::Value) -> String {
        data.get("content")
            .and_then(|c| c.as_array())
            .and_then(|arr| arr.first())
            .and_then(|item| item.get("text"))
            .and_then(|t| t.as_str())
            .unwrap_or("Unknown error")
            .to_string()
    }
}
