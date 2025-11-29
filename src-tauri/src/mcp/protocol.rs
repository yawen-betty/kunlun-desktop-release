use std::io::{BufRead, BufReader, Write};
use std::process::{ChildStdin, ChildStdout};
use std::sync::Arc;
use tokio::sync::Mutex;

/// MCP 协议客户端
/// 
/// 负责与 MCP Server 进行 JSON-RPC 通信
pub struct McpProtocol {
    stdin: Arc<Mutex<ChildStdin>>,
    stdout: Arc<Mutex<BufReader<ChildStdout>>>,
    request_id: u64,
}

impl McpProtocol {
    /// 创建新的协议客户端
    pub fn new(stdin: ChildStdin, stdout: ChildStdout) -> Self {
        Self {
            stdin: Arc::new(Mutex::new(stdin)),
            stdout: Arc::new(Mutex::new(BufReader::new(stdout))),
            request_id: 0,
        }
    }

    /// 初始化 MCP 客户端
    pub async fn initialize(&mut self) -> Result<(), String> {
        let request = serde_json::json!({
            "jsonrpc": "2.0",
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "kunlun-desktop",
                    "version": "1.0.0"
                }
            },
            "id": 1
        });

        let response = self.send_request(request).await?;
        eprintln!("[MCP] Initialize response: {:?}", response);

        // 发送 initialized 通知
        let notify = serde_json::json!({
            "jsonrpc": "2.0",
            "method": "initialized"
        });

        self.send_notification(notify).await?;
        Ok(())
    }

    /// 发送请求并等待响应
    pub async fn send_request(&mut self, mut request: serde_json::Value) -> Result<serde_json::Value, String> {
        self.request_id += 1;
        request["id"] = serde_json::json!(self.request_id);

        let request_str = serde_json::to_string(&request)
            .map_err(|e| format!("Failed to serialize request: {}", e))?;

        eprintln!("[MCP] Sending request: {}", request_str);

        // 发送到 stdin
        {
            let mut stdin = self.stdin.lock().await;
            writeln!(stdin, "{}", request_str)
                .map_err(|e| format!("Failed to write to stdin: {}", e))?;
            stdin.flush()
                .map_err(|e| format!("Failed to flush stdin: {}", e))?;
        }

        // 从 stdout 读取响应
        let mut stdout = self.stdout.lock().await;
        let mut line = String::new();
        stdout.read_line(&mut line)
            .map_err(|e| format!("Failed to read from stdout: {}", e))?;

        eprintln!("[MCP] Received response: {}", line.trim());

        let response: serde_json::Value = serde_json::from_str(&line)
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        // 检查错误
        if let Some(error) = response.get("error") {
            return Err(format!("MCP error: {}", error));
        }

        Ok(response)
    }

    /// 发送通知（不需要响应）
    async fn send_notification(&mut self, request: serde_json::Value) -> Result<(), String> {
        let request_str = serde_json::to_string(&request)
            .map_err(|e| format!("Failed to serialize notification: {}", e))?;

        eprintln!("[MCP] Sending notification: {}", request_str);

        let mut stdin = self.stdin.lock().await;
        writeln!(stdin, "{}", request_str)
            .map_err(|e| format!("Failed to write notification: {}", e))?;
        stdin.flush()
            .map_err(|e| format!("Failed to flush notification: {}", e))?;

        Ok(())
    }

    /// 列出可用工具
    pub async fn list_tools(&mut self) -> Result<serde_json::Value, String> {
        let request = serde_json::json!({
            "jsonrpc": "2.0",
            "method": "tools/list"
        });

        let response = self.send_request(request).await?;
        Ok(response.get("result").cloned().unwrap_or(response))
    }

    /// 调用工具
    pub async fn call_tool(&mut self, tool_name: &str, args: serde_json::Value) -> Result<serde_json::Value, String> {
        let request = serde_json::json!({
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": args
            }
        });

        let response = self.send_request(request).await?;
        Ok(response.get("result").cloned().unwrap_or(response))
    }
}
