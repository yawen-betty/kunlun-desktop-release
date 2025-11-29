use tauri::State;
use tokio::sync::Mutex;
use crate::mcp::McpManager;
use crate::cdp::{Cookie, NetworkEvent};

/// 初始化 CDP（确保连接并启用网络监听）
#[tauri::command]
pub async fn cdp_init(
    state: State<'_, Mutex<McpManager>>,
) -> Result<String, String> {
    let mut manager = state.lock().await;
    
    eprintln!("[CDP] Initializing...");
    
    // 连接 CDP
    let cdp = manager.get_cdp_client().await?;
    
    // 启用网络监听
    cdp.enable_network().await?;
    
    eprintln!("[CDP] Initialized and network monitoring enabled");
    Ok("CDP initialized successfully".to_string())
}

/// 测试 CDP 连接状态
#[tauri::command]
pub async fn cdp_test_connection(
    state: State<'_, Mutex<McpManager>>,
) -> Result<String, String> {
    let mut manager = state.lock().await;
    
    let cdp = manager.get_cdp_client().await?;
    
    // 执行简单的 JavaScript 测试连接
    let result = cdp.execute_script("1 + 1").await?;
    
    Ok(format!("CDP connected! Test result: {:?}", result))
}

/// 执行 JavaScript
#[tauri::command]
pub async fn cdp_execute_script(
    script: String,
    state: State<'_, Mutex<McpManager>>,
) -> Result<serde_json::Value, String> {
    let mut manager = state.lock().await;
    
    let cdp = manager.get_cdp_client().await?;
    
    cdp.execute_script(&script).await
}

/// 获取 Cookies
#[tauri::command]
pub async fn cdp_get_cookies(
    state: State<'_, Mutex<McpManager>>,
) -> Result<Vec<Cookie>, String> {
    let mut manager = state.lock().await;
    
    let cdp = manager.get_cdp_client().await?;
    
    cdp.get_cookies().await
}

/// 启用网络监听
#[tauri::command]
pub async fn cdp_enable_network(
    state: State<'_, Mutex<McpManager>>,
) -> Result<(), String> {
    let mut manager = state.lock().await;
    
    let cdp = manager.get_cdp_client().await?;
    
    cdp.enable_network().await
}

/// 获取网络事件
#[tauri::command]
pub async fn cdp_get_network_events(
    state: State<'_, Mutex<McpManager>>,
) -> Result<Vec<NetworkEvent>, String> {
    let mut manager = state.lock().await;
    
    let cdp = manager.get_cdp_client().await?;
    
    Ok(cdp.get_network_events().await)
}

/// 清除网络事件
#[tauri::command]
pub async fn cdp_clear_network_events(
    state: State<'_, Mutex<McpManager>>,
) -> Result<(), String> {
    let mut manager = state.lock().await;
    
    let cdp = manager.get_cdp_client().await?;
    
    cdp.clear_network_events().await;
    Ok(())
}

/// 获取指定请求的响应体
#[tauri::command]
pub async fn cdp_get_response_body(
    request_id: String,
    state: State<'_, Mutex<McpManager>>,
) -> Result<String, String> {
    let mut manager = state.lock().await;
    
    let cdp = manager.get_cdp_client().await?;
    
    cdp.get_response_body(&request_id).await
}

/// 发送原始 CDP 命令
#[tauri::command]
pub async fn cdp_send_command(
    method: String,
    params: serde_json::Value,
    state: State<'_, Mutex<McpManager>>,
) -> Result<serde_json::Value, String> {
    let mut manager = state.lock().await;
    
    let cdp = manager.get_cdp_client().await?;
    
    // 对于 Network.setCookie，需要使用 session
    if method == "Network.setCookie" {
        return cdp.set_cookie(params).await;
    }
    
    cdp.send_command(&method, params).await
}
