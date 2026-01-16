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
mod tray;

use tokio::sync::Mutex;
use std::sync::Arc;
use mcp::McpManager;
use ai::AIManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
      let mut builder = tauri::Builder::default();
      #[cfg(desktop)]
      {
          builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
              // 当尝试启动第二个实例时，显示并聚焦已有窗口
              if let Some(window) = app.get_webview_window("main") {
                  let _ = window.show();
                  let _ = window.set_focus();
                  let _ = window.unminimize(); // macOS 特殊处理
              }
          }));
      }

      builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .manage(Mutex::new(McpManager::new()))
        .invoke_handler(tauri::generate_handler![
            greet,
            save_token,
            get_token,
            http_request,
            download_pdf,
            download_file,
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
            // 获取 cancel_flag 的引用并单独管理
            let cancel_flag = ai_manager.get_cancel_flag();
            app.manage(Mutex::new(ai_manager));
            app.manage(cancel_flag);

            // 创建系统托盘
            tray::create_tray(&app.handle())?;

            // 处理窗口关闭事件 - 隐藏到托盘而不是退出
            let app_handle = app.handle().clone();
            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        tray::hide_to_tray(&app_handle);
                    }
                });
            }

            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
