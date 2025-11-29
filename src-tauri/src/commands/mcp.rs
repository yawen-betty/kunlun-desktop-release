use tauri::{AppHandle, State};
use tokio::sync::Mutex;
use crate::mcp::{McpManager, BrowserStatus};
use crate::mcp::browser::BrowserManager;

#[tauri::command]
pub async fn start_mcp_server(
    app: AppHandle,
    headless: bool,
    state: State<'_, Mutex<McpManager>>,
) -> Result<String, String> {
    let mut manager = state.lock().await;
    manager.start(&app, headless).await
}

#[tauri::command]
pub async fn stop_mcp_server(
    state: State<'_, Mutex<McpManager>>,
) -> Result<(), String> {
    let mut manager = state.lock().await;
    manager.stop()
}

#[tauri::command]
pub fn check_mcp_browser(
    state: State<'_, Mutex<McpManager>>,
) -> Result<BrowserStatus, String> {
    let manager = state.blocking_lock();
    Ok(manager.check_browser_installed())
}

#[tauri::command]
pub async fn install_mcp_browser(
    app: AppHandle,
    _state: State<'_, Mutex<McpManager>>,
) -> Result<(), String> {
    BrowserManager::install(&app).await
}

#[tauri::command]
pub async fn mcp_call_tool(
    tool_name: String,
    args: serde_json::Value,
    state: State<'_, Mutex<McpManager>>,
) -> Result<serde_json::Value, String> {
    let mut manager = state.lock().await;
    manager.call_tool(&tool_name, args).await
}
