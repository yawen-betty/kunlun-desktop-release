use std::io::{BufRead, BufReader};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use tauri::{AppHandle, Manager};
use tauri::path::BaseDirectory;

/// MCP 进程管理器
///
/// 负责启动和管理 MCP Server 进程
pub struct McpProcess {
    child: Child,
    pub cdp_port: Option<u16>,
}

impl McpProcess {
    /// 启动 MCP Server 进程
    pub async fn spawn(app: &AppHandle, headless: bool) -> Result<(Self, ChildStdin, ChildStdout), String> {
        let resource_dir = app.path()
            .resource_dir()
            .map_err(|e| format!("Failed to get resource dir: {}", e))?;

        let mcp_entry = resource_dir.join("binaries/mcp-entry.cjs");
        let mcp_modules = resource_dir.join("binaries/mcp-modules");
        let browsers_path = mcp_modules.join(".playwright-browsers");

        eprintln!("[MCP] Entry path: {:?}", mcp_entry);
        eprintln!("[MCP] Entry exists: {}", mcp_entry.exists());
        eprintln!("[MCP] Browsers path: {}", browsers_path.display());
        eprintln!("[MCP] Browsers path exists: {}", browsers_path.exists());

        // 获取 sidecar node 路径（Windows 为 node.exe）
        let node_filename = if cfg!(target_os = "windows") {
            "binaries/node.exe"
        } else {
            "binaries/node"
        };
        
        let node_path = app.path()
            .resolve(node_filename, BaseDirectory::Resource)
            .map_err(|e| format!("Failed to resolve node path: {}", e))?;
        
        // Windows: 移除 UNC 路径前缀 \\?\
        let node_path_str = node_path.to_string_lossy().to_string();
        let node_path_clean = node_path_str.strip_prefix(r"\\?\").unwrap_or(&node_path_str);
        
        eprintln!("[MCP] Using node: {}", node_path_clean);
        let mut cmd = Command::new(node_path_clean);
        let entry_str = mcp_entry.to_string_lossy().to_string();
        let entry_clean = entry_str.strip_prefix(r"\\?\").unwrap_or(&entry_str);
        cmd.arg(entry_clean)
            .arg("--browser")
            .arg("chromium")
            .arg("--isolated");

        if !headless {
            eprintln!("[MCP] Starting in HEADED mode (visible browser)");
        } else {
            eprintln!("[MCP] Starting in HEADLESS mode");
            cmd.arg("--headless");
        }

        let mut child = cmd.env("PLAYWRIGHT_BROWSERS_PATH", browsers_path.to_str().unwrap())
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn process: {}", e))?;

        eprintln!("[MCP] Process spawned with PID: {:?}", child.id());

        // 捕获 stderr 并解析 CDP 端口
        let cdp_port = std::sync::Arc::new(std::sync::Mutex::new(None));
        let cdp_port_clone = cdp_port.clone();

        if let Some(stderr) = child.stderr.take() {
            tokio::spawn(async move {
                let reader = BufReader::new(stderr);
                for line in reader.lines().flatten() {
                    eprintln!("[MCP stderr] {}", line);

                    // 解析 CDP 端口: --remote-debugging-port=XXXXX
                    if line.contains("--remote-debugging-port=") {
                        if let Some(port_str) = line.split("--remote-debugging-port=").nth(1) {
                            if let Some(port_str) = port_str.split_whitespace().next() {
                                if let Ok(port) = port_str.parse::<u16>() {
                                    eprintln!("[MCP] Detected CDP port: {}", port);
                                    *cdp_port_clone.lock().unwrap() = Some(port);
                                }
                            }
                        }
                    }
                }
            });
        }

        // 等待 CDP 端口被检测到（增加等待时间）
        tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
        let detected_port = *cdp_port.lock().unwrap();

        if detected_port.is_some() {
            eprintln!("[MCP] Detected CDP port from stderr: {:?}", detected_port);
        } else {
            eprintln!("[MCP] No CDP port detected from stderr");
        }

        let stdin = child.stdin.take()
            .ok_or("Failed to get stdin")?;
        let stdout = child.stdout.take()
            .ok_or("Failed to get stdout")?;

        Ok((Self { child, cdp_port: detected_port }, stdin, stdout))
    }

    /// 终止进程
    pub fn kill(mut self) -> Result<(), String> {
        self.child.kill()
            .map_err(|e| format!("Failed to kill process: {}", e))
    }
}
