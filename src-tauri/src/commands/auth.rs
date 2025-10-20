use tauri::command;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use serde_json::json;

const STORE_KEY: &str = "auth_token";
const STORE_NAME: &str = "auth_store.json";

#[command]
pub async fn save_token(app_handle: AppHandle, token: String) -> Result<String, String> {
    // 使用官方推荐的 StoreExt trait 方法获取存储实例
    let store = app_handle
        .store(STORE_NAME)
        .map_err(|e| format!("获取存储实例失败: {}", e))?;
    
    // 使用 json! 宏来设置值，确保与 JavaScript 绑定兼容
    store.set(STORE_KEY, json!(token.clone()));
    
    // 保存更改到文件
    store.save()
        .map_err(|e| format!("保存存储文件失败: {}", e))?;
    
    Ok(token)
}

#[command]
pub async fn get_token(app_handle: AppHandle) -> Result<String, String> {
    // 使用官方推荐的 StoreExt trait 方法获取存储实例
    let store = app_handle
        .store(STORE_NAME)
        .map_err(|e| format!("获取存储实例失败: {}", e))?;
    
    // 尝试获取 token 值
    match store.get(STORE_KEY) {
        Some(token_value) => {
            // 将 json value 转换为字符串
            match token_value.as_str() {
                Some(token_str) => Ok(token_str.to_string()),
                None => Ok("no token".to_string())
            }
        },
        None => Ok("no token".to_string())
    }
}
