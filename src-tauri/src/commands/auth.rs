use tauri::command;

#[command]
pub fn get_token() -> Result<String, String> {
  // 使用系统级数据目录存储 token
//   let app_data = tauri::api::path::app_data_dir().unwrap();
//   let token_path = app_data.join("token.txt");
//   std::fs::write(&token_path, &token).map_err(|e| e.to_string())?;
  Ok("no token".to_string())
}

#[command]
pub fn save_token() -> Result<String, String> {
    // 获取token
//     let app_data = tauri::api::path::app_data_dir().unwrap();
//     let token_path = app_data.join("token.txt");
//     if token_path.exists() {
//       let content = std::fs::read_to_string(&token_path).map_err(|e| e.to_string())?;
//       Ok(content)
//     } else {
//       Ok("no token".to_string())
//     }
  Ok("token saved".to_string())
}
