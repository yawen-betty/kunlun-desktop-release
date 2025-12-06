use std::io::{BufRead, BufReader};
use std::process::Stdio;
use tauri::{AppHandle, Manager};
use tauri::path::BaseDirectory;
use super::types::BrowserStatus;

/// 浏览器管理器
/// 
/// 负责检查和安装 Playwright 浏览器
pub struct BrowserManager;

impl BrowserManager {
    /// 检查浏览器是否已安装
    pub fn check_installed(app: &AppHandle) -> BrowserStatus {
        // 检查 resource_dir 下的浏览器
        if let Ok(resource_dir) = app.path().resource_dir() {
            let browser_dir = resource_dir.join("binaries/mcp-modules/.playwright-browsers");
            
            if let Ok(entries) = std::fs::read_dir(&browser_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_dir() && path.file_name()
                        .and_then(|n| n.to_str())
                        .map(|n| n.starts_with("chromium-"))
                        .unwrap_or(false)
                    {
                        return BrowserStatus {
                            installed: true,
                            path: Some(path.to_string_lossy().to_string()),
                        };
                    }
                }
            }
        }

        BrowserStatus {
            installed: false,
            path: None,
        }
    }



    /// 安装浏览器
    pub async fn install(app: &AppHandle) -> Result<(), String> {
        let resource_dir = app.path()
            .resource_dir()
            .map_err(|e| format!("Failed to get resource dir: {}", e))?;

        let mcp_modules = resource_dir.join("binaries/mcp-modules");
        let browsers_path = mcp_modules.join(".playwright-browsers");
        
        // 获取 sidecar node 路径
        let node_path = app.path()
            .resolve("binaries/node", BaseDirectory::Resource)
            .map_err(|e| format!("Failed to resolve node path: {}", e))?;
        
        // playwright CLI 真实路径（不使用符号链接）
        let playwright_bin = mcp_modules.join("node_modules/playwright/cli.js");
        
        // Windows: 移除 UNC 路径前缀 \\?\
        let node_path_str = node_path.to_string_lossy().to_string();
        let node_path_clean = node_path_str.strip_prefix(r"\\?\").unwrap_or(&node_path_str);
        
        let playwright_str = playwright_bin.to_string_lossy().to_string();
        let playwright_clean = playwright_str.strip_prefix(r"\\?\").unwrap_or(&playwright_str);
        
        let browsers_path_str = browsers_path.to_string_lossy().to_string();
        let browsers_path_clean = browsers_path_str.strip_prefix(r"\\?\").unwrap_or(&browsers_path_str);
        
        let mcp_modules_str = mcp_modules.to_string_lossy().to_string();
        let mcp_modules_clean = mcp_modules_str.strip_prefix(r"\\?\").unwrap_or(&mcp_modules_str);
        
        eprintln!("[Browser] Installing to: {}", browsers_path_clean);
        eprintln!("[Browser] Using node: {}", node_path_clean);
        eprintln!("[Browser] Playwright CLI: {}", playwright_clean);

        let mut child = std::process::Command::new(node_path_clean)
            .arg(playwright_clean)
            .arg("install")
            .arg("chromium")
            .current_dir(mcp_modules_clean)
            .env("PLAYWRIGHT_BROWSERS_PATH", browsers_path_clean)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn playwright install: {}", e))?;

        // 捕获输出
        if let Some(stdout) = child.stdout.take() {
            tokio::spawn(async move {
                let reader = BufReader::new(stdout);
                for line in reader.lines().flatten() {
                    eprintln!("[Playwright] {}", line);
                }
            });
        }
        
        if let Some(stderr) = child.stderr.take() {
            tokio::spawn(async move {
                let reader = BufReader::new(stderr);
                for line in reader.lines().flatten() {
                    eprintln!("[Playwright Error] {}", line);
                }
            });
        }

        Ok(())
    }

    /// 等待浏览器安装完成
    pub async fn wait_for_installation(app: &AppHandle, timeout_secs: u64) -> Result<(), String> {
        let max_attempts = timeout_secs / 5;
        
        for i in 0..max_attempts {
            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            
            if Self::check_installed(app).installed {
                eprintln!("[Browser] Installation completed");
                return Ok(());
            }
            
            eprintln!("[Browser] Waiting for installation... ({}/{})", i + 1, max_attempts);
        }
        
        Err("Browser installation timeout".to_string())
    }
}
