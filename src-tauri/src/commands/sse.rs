use tauri::{command, AppHandle, Emitter};
use std::collections::HashMap;
use futures_util::StreamExt;

// SSE 流式请求
#[command]
pub async fn sse_request(
    app: AppHandle,
    url: String,
    headers: Option<HashMap<String, String>>,
    body: Option<serde_json::Value>,
    event_id: String
) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("创建HTTP客户端失败: {}", e))?;

    let mut request_builder = client.post(&url);

    // 添加请求头
    if let Some(h) = headers {
        for (key, value) in h {
            request_builder = request_builder.header(&key, &value);
        }
    }

    // 添加请求体
    if let Some(b) = body {
        request_builder = request_builder.json(&b);
    }

    // 发送请求
    let response = request_builder
        .send()
        .await
        .map_err(|e| format!("请求发送失败: {}", e))?;

    // 检查响应状态
    if !response.status().is_success() {
        let status = response.status().as_u16();
        let error_body = response.text().await.unwrap_or_default();
        app.emit(&format!("sse-error-{}", event_id), 
            serde_json::json!({
                "status": status,
                "error": error_body
            })
        ).ok();
        return Err(format!("请求失败: {}", status));
    }

    // 获取字节流
    let mut stream = response.bytes_stream();
    let mut buffer = String::new();

    // 读取流数据
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                let text = String::from_utf8_lossy(&bytes);
                buffer.push_str(&text);

                // 处理 SSE 数据
                while let Some(pos) = buffer.find("\n\n") {
                    let event_data = buffer[..pos].to_string();
                    buffer = buffer[pos + 2..].to_string();

                    // 解析 SSE 事件
                    for line in event_data.lines() {
                        if line.starts_with("data:") {
                            let data = line[5..].trim();
                            // 发送事件到前端
                            app.emit(&format!("sse-message-{}", event_id), data).ok();
                        }
                    }
                }
            }
            Err(e) => {
                app.emit(&format!("sse-error-{}", event_id), 
                    format!("流读取错误: {}", e)
                ).ok();
                return Err(format!("流读取错误: {}", e));
            }
        }
    }

    // 发送完成事件
    app.emit(&format!("sse-complete-{}", event_id), "complete").ok();
    Ok(())
}
