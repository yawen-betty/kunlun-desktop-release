// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // 调用lib.rs中的run函数，该函数已经包含了所有插件的注册和命令的注册
  tauri_test_lib::run();
}
