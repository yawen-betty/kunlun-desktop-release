// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod commands;
use commands::*;

mod mcp;
mod ai;
mod cdp;

use tokio::sync::Mutex;
use std::sync::Arc;
use mcp::McpManager;
use ai::AIManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(Mutex::new(McpManager::new()))
        .invoke_handler(tauri::generate_handler![
            greet,
            save_token,
            get_token,
            http_request,
            download_pdf,
            image_to_base64,
            sse_request,
            start_mcp_server,
            stop_mcp_server,
            check_mcp_browser,
            install_mcp_browser,
            mcp_call_tool,
            ai_execute_task,
            ai_execute_task_with_config,
            ai_stop_task,
            cdp_init,
            cdp_test_connection,
            cdp_execute_script,
            cdp_get_cookies,
            cdp_enable_network,
            cdp_get_network_events,
            cdp_clear_network_events,
            cdp_get_response_body,
            cdp_send_command,
            save_channel_cookies,
            get_channel_cookies,
            get_cache_size,
            clear_cache
        ])
        .setup(|app| {
            // 初始化 AIManager - 使用已经注册的 McpManager
            let mcp_manager_state = app.state::<Mutex<McpManager>>();
            // 将 State 转换为 Arc<Mutex<McpManager>>
            let mcp_manager_arc: Arc<Mutex<McpManager>> = unsafe {
                Arc::from_raw(mcp_manager_state.inner() as *const Mutex<McpManager>)
            };
            // 增加引用计数，避免被释放
            let mcp_manager_clone = Arc::clone(&mcp_manager_arc);
            std::mem::forget(mcp_manager_arc);

            let ai_manager = AIManager::new(mcp_manager_clone);
            app.manage(Arc::new(Mutex::new(ai_manager)));

//             #[cfg(desktop)]
//              if let Err(e) = app.handle().plugin(tauri_plugin_updater::Builder::new().build()) {
//                eprintln!("Failed to initialize updater plugin: {}", e);
//              }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
