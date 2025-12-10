use tauri::AppHandle;
use super::types::BrowserStatus;
use super::browser::BrowserManager;
use super::process::McpProcess;
use super::protocol::McpProtocol;
use crate::cdp::CDPClient;

/// MCP 管理器
///
/// 负责协调 MCP Server 的启动、通信和生命周期管理
pub struct McpManager {
    process: Option<McpProcess>,
    protocol: Option<McpProtocol>,
    cdp_client: Option<CDPClient>,
    cdp_port: Option<u16>,
    initialized: bool,
    app_handle: Option<AppHandle>,
}

impl McpManager {
    /// 创建新的 MCP 管理器
    pub fn new() -> Self {
        Self {
            process: None,
            protocol: None,
            cdp_client: None,
            cdp_port: None,
            initialized: false,
            app_handle: None,
        }
    }

    /// 启动 MCP Server
    pub async fn start(&mut self, app: &AppHandle, headless: bool) -> Result<String, String> {
        // 保存 AppHandle
        self.app_handle = Some(app.clone());
        // 检查并安装浏览器
        if !BrowserManager::check_installed(app).installed {
            eprintln!("[MCP] Browser not installed, starting installation...");
            BrowserManager::install(app).await?;
            BrowserManager::wait_for_installation(app, 300).await?;
        }

        // 启动进程
        eprintln!("[MCP] Starting MCP Server (headless: {})...", headless);
        let (process, stdin, stdout) = McpProcess::spawn(app, headless).await?;

        // 保存 CDP 端口
        if let Some(port) = process.cdp_port {
            eprintln!("[MCP] CDP port from process: {}", port);
            self.cdp_port = Some(port);
        }

        self.process = Some(process);

        // 等待进程启动
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

        // 初始化协议
        eprintln!("[MCP] Initializing protocol...");
        let mut protocol = McpProtocol::new(stdin, stdout);
        protocol.initialize().await?;

        self.protocol = Some(protocol);
        self.initialized = true;

        // 打开空白页触发浏览器启动
        eprintln!("[MCP] Opening blank page to start browser...");
        match self.protocol.as_mut()
            .unwrap()
            .call_tool("browser_navigate", serde_json::json!({"url": "about:blank"}))
            .await
        {
            Ok(_) => {
                // 等待浏览器完全启动
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

                // 连接 CDP
                eprintln!("[MCP] Connecting CDP...");
                match self.connect_cdp().await {
                    Ok(_) => eprintln!("[MCP] CDP connected successfully"),
                    Err(e) => eprintln!("[MCP] Warning: Failed to connect CDP: {}", e),
                }
            }
            Err(e) => {
                eprintln!("[MCP] Warning: Failed to open blank page: {}", e);
                eprintln!("[MCP] CDP will connect on first browser use");
            }
        }

        eprintln!("[MCP] Server started successfully");
        Ok("MCP Server started in stdio mode".to_string())
    }

    /// 停止 MCP Server
    pub fn stop(&mut self) -> Result<(), String> {
        eprintln!("[MCP] Stopping MCP Server...");

        // 0. 先关闭浏览器（在断开 CDP 之前）
        if self.protocol.is_some() && self.initialized {
            eprintln!("[MCP] Closing browser...");
            // 尝试关闭浏览器，如果失败也继续
            let _ = self.protocol.as_mut()
                .unwrap()
                .call_tool("browser_close", serde_json::json!({}));
            // 等待浏览器关闭
            std::thread::sleep(std::time::Duration::from_millis(500));
        }

        // 1. 先断开 CDP（释放 WebSocket 连接）
        if self.cdp_client.is_some() {
            eprintln!("[MCP] Disconnecting CDP...");
            self.cdp_client = None;
        }

        // 2. 清理协议
        if self.protocol.is_some() {
            eprintln!("[MCP] Closing protocol...");
            self.protocol = None;
        }

        // 3. 关闭 MCP 进程
        if let Some(process) = self.process.take() {
            eprintln!("[MCP] Killing MCP process...");
            process.kill()?;
        }

        // 4. 等待资源释放
        std::thread::sleep(std::time::Duration::from_millis(500));

        // 5. 清理 Playwright Chrome 进程
        eprintln!("[MCP] Cleaning up Chrome processes...");
        #[cfg(target_os = "windows")]
        {
            let _ = std::process::Command::new("taskkill")
                .args(&["/F", "/FI", "IMAGENAME eq chrome.exe", "/FI", "COMMANDLINE eq *playwright-browsers*"])
                .output();
        }

        #[cfg(not(target_os = "windows"))]
        {
            let _ = std::process::Command::new("pkill")
                .arg("-f")
                .arg("playwright-browsers.*chrome")
                .output();
        }

        // 6. 重置所有状态
        self.cdp_port = None;
        self.initialized = false;
        self.app_handle = None;

        // 7. 再等待一下确保进程完全退出
        std::thread::sleep(std::time::Duration::from_millis(500));

        eprintln!("[MCP] Server stopped successfully");
        Ok(())
    }

    /// 连接 CDP
    async fn connect_cdp(&mut self) -> Result<(), String> {
        // 获取 CDP 端口
        let port = self.discover_cdp_port().await?;
        self.cdp_port = Some(port);

        // 获取 WebSocket URL
        let ws_url = self.get_cdp_websocket_url(port).await?;

        // 连接 CDP（传入 AppHandle）
        let cdp_client = CDPClient::connect_with_app(&ws_url, self.app_handle.clone()).await?;
        self.cdp_client = Some(cdp_client);

        Ok(())
    }

    /// 发现 CDP 端口（从 Chrome 进程参数中获取）
    async fn discover_cdp_port(&self) -> Result<u16, String> {
        // 先使用从进程中解析的端口
        if let Some(port) = self.cdp_port {
            eprintln!("[CDP] Using port from process: {}", port);
            return Ok(port);
        }

        // 从 Chrome 进程参数中查找 CDP 端口
        eprintln!("[CDP] Searching for Chrome process with CDP port...");

        for _ in 0..10 {
            #[cfg(target_os = "windows")]
            let output = std::process::Command::new("wmic")
                .args(&[
                    "process", "where",
                    "name='chrome.exe' and commandline like '%playwright-browsers%' and commandline like '%--no-startup-window%'",
                    "get", "commandline"
                ])
                .output()
                .map_err(|e| format!("Failed to run wmic: {}", e))?;

            #[cfg(not(target_os = "windows"))]
            let output = std::process::Command::new("ps")
                .args(&["aux"])
                .output()
                .map_err(|e| format!("Failed to run ps: {}", e))?;

            let stdout = String::from_utf8_lossy(&output.stdout);

            for line in stdout.lines() {
                if line.contains("--remote-debugging-port=") {
                    // 解析端口号
                    if let Some(port_str) = line.split("--remote-debugging-port=").nth(1) {
                        if let Some(port_str) = port_str.split_whitespace().next() {
                            if let Ok(port) = port_str.parse::<u16>() {
                                eprintln!("[CDP] Found CDP port from Chrome process: {}", port);
                                return Ok(port);
                            }
                        }
                    }
                }
            }

            // 等待一下再重试
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        }

        Err("Failed to discover CDP port from Chrome process".to_string())
    }

    /// 获取 CDP WebSocket URL（连接到浏览器级别）
    async fn get_cdp_websocket_url(&self, port: u16) -> Result<String, String> {
        // 使用 /json/version 获取浏览器级别的 WebSocket URL
        let version_url = format!("http://localhost:{}/json/version", port);
        eprintln!("[CDP] Getting browser-level WebSocket from: {}", version_url);

        if let Ok(response) = reqwest::get(&version_url).await {
            if let Ok(json) = response.json::<serde_json::Value>().await {
                eprintln!("[CDP] Version response: {:?}", json);
                if let Some(ws_url) = json["webSocketDebuggerUrl"].as_str() {
                    eprintln!("[CDP] Using browser-level WebSocket: {}", ws_url);
                    return Ok(ws_url.to_string());
                }
            }
        }

        Err("Failed to get browser WebSocket URL".to_string())
    }



    /// 列出可用工具
    pub async fn list_tools(&mut self) -> Result<serde_json::Value, String> {
        if !self.initialized {
            return Err("MCP client not initialized".to_string());
        }

        self.protocol.as_mut()
            .ok_or("Protocol not available")?
            .list_tools()
            .await
    }

    /// 调用工具
    pub async fn call_tool(&mut self, tool_name: &str, args: serde_json::Value) -> Result<serde_json::Value, String> {
        if !self.initialized {
            return Err("MCP client not initialized".to_string());
        }

        self.protocol.as_mut()
            .ok_or("Protocol not available")?
            .call_tool(tool_name, args)
            .await
    }

    /// 获取 CDP 客户端（懒加载）
    pub async fn get_cdp_client(&mut self) -> Result<&mut CDPClient, String> {
        // 检查 MCP 是否已初始化
        if !self.initialized {
            return Err("MCP not initialized, cannot connect CDP".to_string());
        }

        // 如果已经连接，直接返回
        if self.cdp_client.is_some() {
            return Ok(self.cdp_client.as_mut().unwrap());
        }

        // 否则现在连接
        eprintln!("[CDP] Lazy connecting...");
        self.connect_cdp().await?;

        Ok(self.cdp_client.as_mut().unwrap())
    }
}
