use tauri::command;
use base64::{Engine as _, engine::general_purpose};

// 将服务器图片URL转换为Base64
#[command]
pub async fn image_to_base64(url: String) -> Result<String, String> {
    // 验证URL
    let url = url.trim();
    if url.is_empty() {
        return Err("URL不能为空".to_string());
    }

    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err("无效的URL协议".to_string());
    }

    // 创建HTTP客户端
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("创建HTTP客户端失败: {}", e))?;

    // 下载图片
    let response = client.get(url)
        .send()
        .await
        .map_err(|e| format!("请求图片失败: {}", e))?;

    // 检查响应状态
    if !response.status().is_success() {
        return Err(format!("请求失败，状态码: {}", response.status()));
    }

    // 获取MIME类型并转为String
    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("image/png")
        .split(';')
        .next()
        .unwrap_or("image/png")
        .to_string();

    // 读取图片字节
    let bytes = response.bytes()
        .await
        .map_err(|e| format!("读取图片数据失败: {}", e))?;

    // 转换为Base64
    let base64_str = general_purpose::STANDARD.encode(&bytes);

    // 返回Data URL格式
    Ok(format!("data:{};base64,{}", content_type, base64_str))
}
