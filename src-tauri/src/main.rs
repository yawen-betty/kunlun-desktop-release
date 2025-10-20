// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands; // 声明模块

use tauri::{Builder};
use tauri_plugin_http::init as http_plugin; // 导入http插件
use crate::commands::{save_token, get_token, http_request};

fn main() {
//   tauri_test_lib::run()
  Builder::default()
    .plugin(http_plugin()) // 注册http插件
    .invoke_handler(tauri::generate_handler![
      save_token,
      get_token,
      http_request
    ])
    .run(tauri::generate_context!())
    .expect("运行中错误");
}
