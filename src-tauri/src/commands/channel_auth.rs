use tauri::command;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use serde_json::json;
use std::collections::HashMap;

const STORE_KEY: &str = "channel_cookies";
const STORE_NAME: &str = "auth_store.json";

/// 保存指定渠道的 Cookies
/// 
/// # 参数
/// * `app_handle` - Tauri 应用句柄
/// * `channel_name` - 渠道名称（如 "boss", "zhipin", "linkedin"）
/// * `cookies` - Cookie 字符串
/// 
/// # 说明
/// 只更新指定渠道的 Cookies，其他渠道的数据保持不变
#[command]
pub async fn save_channel_cookies(
    app_handle: AppHandle,
    channel_name: String,
    cookies: String,
) -> Result<(), String> {
    let store = app_handle
        .store(STORE_NAME)
        .map_err(|e| format!("获取存储实例失败: {}", e))?;
    
    // 获取现有的 channel_cookies Map，如果不存在则创建新的
    let mut channel_map: HashMap<String, String> = match store.get(STORE_KEY) {
        Some(value) => {
            serde_json::from_value(value.clone())
                .unwrap_or_else(|_| HashMap::new())
        }
        None => HashMap::new(),
    };
    
    // 更新指定渠道的 Cookies
    channel_map.insert(channel_name, cookies);
    
    // 保存整个 Map
    store.set(STORE_KEY, json!(channel_map));
    
    // 保存到文件
    store.save()
        .map_err(|e| format!("保存存储文件失败: {}", e))?;
    
    Ok(())
}

/// 获取渠道 Cookies
/// 
/// # 参数
/// * `app_handle` - Tauri 应用句柄
/// * `channel_name` - 渠道名称（可选）
///   - 如果提供：返回指定渠道的 Cookies 字符串
///   - 如果为空：返回所有渠道的 Cookies Map（JSON 字符串）
/// 
/// # 返回
/// - 指定渠道：返回 Cookie 字符串，不存在则返回 "no cookies"
/// - 所有渠道：返回 JSON 字符串格式的 Map
#[command]
pub async fn get_channel_cookies(
    app_handle: AppHandle,
    channel_name: Option<String>,
) -> Result<String, String> {
    let store = app_handle
        .store(STORE_NAME)
        .map_err(|e| format!("获取存储实例失败: {}", e))?;
    
    // 获取整个 channel_cookies Map
    let channel_map: HashMap<String, String> = match store.get(STORE_KEY) {
        Some(value) => {
            serde_json::from_value(value.clone())
                .unwrap_or_else(|_| HashMap::new())
        }
        None => HashMap::new(),
    };
    
    // 根据是否提供 channel_name 返回不同结果
    match channel_name {
        Some(name) => {
            // 返回指定渠道的 Cookies
            Ok(channel_map.get(&name)
                .cloned()
                .unwrap_or_else(|| "no cookies".to_string()))
        }
        None => {
            // 返回整个 Map 的 JSON 字符串
            serde_json::to_string(&channel_map)
                .map_err(|e| format!("序列化失败: {}", e))
        }
    }
}
