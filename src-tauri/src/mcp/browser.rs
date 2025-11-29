use std::io::{BufRead, BufReader};
use std::process::Stdio;
use tauri::{AppHandle, Manager};
use super::types::BrowserStatus;

/// 浏览器管理器
/// 
/// 负责检查和安装 Playwright 浏览器
pub struct BrowserManager;

impl BrowserManager {
    /// 检查浏览器是否已安装
    pub fn check_installed() -> BrowserStatus {
        let browser_dir = Self::get_playwright_browser_dir();
        
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

        BrowserStatus {
            installed: false,
            path: None,
        }
    }

    /// 获取 Playwright 浏览器目录
    fn get_playwright_browser_dir() -> std::path::PathBuf {
        #[cfg(target_os = "macos")]
        {
            dirs::home_dir()
                .unwrap()
                .join("Library/Caches/ms-playwright")
        }

        #[cfg(target_os = "windows")]
        {
            dirs::data_local_dir()
                .unwrap()
                .join("ms-playwright")
        }

        #[cfg(target_os = "linux")]
        {
            dirs::cache_dir()
                .unwrap()
                .join("ms-playwright")
        }
    }

    /// 安装浏览器
    pub async fn install(app: &AppHandle) -> Result<(), String> {
        let resource_dir = app.path()
            .resource_dir()
            .map_err(|e| format!("Failed to get resource dir: {}", e))?;

        let mcp_modules = resource_dir.join("binaries/mcp-modules");
        let browsers_path = mcp_modules.join(".playwright-browsers");
        
        eprintln!("[Browser] Installing to: {:?}", browsers_path);

        let mut child = std::process::Command::new("npx")
            .arg("playwright")
            .arg("install")
            .arg("chromium")
            .current_dir(&mcp_modules)
            .env("PLAYWRIGHT_BROWSERS_PATH", &browsers_path)
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
    pub async fn wait_for_installation(timeout_secs: u64) -> Result<(), String> {
        let max_attempts = timeout_secs / 5;
        
        for i in 0..max_attempts {
            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            
            if Self::check_installed().installed {
                eprintln!("[Browser] Installation completed");
                return Ok(());
            }
            
            eprintln!("[Browser] Waiting for installation... ({}/{})", i + 1, max_attempts);
        }
        
        Err("Browser installation timeout".to_string())
    }
}
