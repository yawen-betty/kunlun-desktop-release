// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands; // 声明模块

use tauri::{Builder};
use crate::commands::{save_token, get_token};

fn main() {
//   tauri_test_lib::run()

  Builder::default()
    .invoke_handler(tauri::generate_handler![
      save_token,
      get_token
    ])
    .run(tauri::generate_context!())
    .expect("运行中错误");
}
