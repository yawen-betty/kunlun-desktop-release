use tauri::command;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// 请求参数结构体
#[derive(Debug, Deserialize)]
pub struct HttpRequest {
    url: String,
    method: String,
    headers: Option<HashMap<String, String>>,
    body: Option<serde_json::Value>,
    file_path: Option<String>,
    file_field_name: Option<String>,
}

// 响应结构体
#[derive(Debug, Serialize)]
pub struct HttpResponse {
    status: u16,
    headers: HashMap<String, String>,
    body: serde_json::Value,
}

#[command]
pub async fn http_request(req: HttpRequest) -> Result<HttpResponse, String> {
    // 验证和清理URL
    let url = req.url.trim();
    if url.is_empty() {
        return Err("URL不能为空".to_string());
    }
    
    // 验证URL是否是有效的HTTP/HTTPS URL
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err(format!("无效的URL协议: {}", url));
    }
    
    // 创建客户端
    let client = match reqwest::Client::builder().build() {
        Ok(client) => client,
        Err(e) => return Err(format!("创建HTTP客户端失败: {}", e)),
    };
    
    // 根据方法创建请求构建器
    let request_builder = match req.method.to_uppercase().as_str() {
        "GET" => client.get(url),
        "POST" => client.post(url),
        "PUT" => client.put(url),
        "DELETE" => client.delete(url),
        "PATCH" => client.patch(url),
        "HEAD" => client.head(url),
        _ => return Err(format!("不支持的请求方法: {}", req.method)),
    };

    // 添加请求头
    let mut request_builder = request_builder;
    if let Some(headers) = req.headers {
        for (key, value) in headers {
            let trimmed_key = key.trim();
            let trimmed_value = value.trim();
            // 验证请求头键不为空
            if !trimmed_key.is_empty() {
                request_builder = request_builder.header(trimmed_key, trimmed_value);
            }
        }
    }

    // 处理文件上传（简化版）
    if req.file_path.is_some() {
        return Err("文件上传功能正在开发中".to_string());
    }
    
    // 处理普通请求体
    if let Some(body) = req.body {
        match body {
            // 对于对象类型，使用json方法
            serde_json::Value::Object(_) => {
                match serde_json::to_string(&body) {
                    Ok(_) => request_builder = request_builder.json(&body),
                    Err(e) => return Err(format!("JSON序列化失败: {}", e)),
                }
            },
            // 对于字符串类型，使用body方法
            serde_json::Value::String(s) => {
                request_builder = request_builder.body(s);
            },
            // 对于其他类型，转换为JSON字符串
            _ => {
                if let Ok(json_str) = serde_json::to_string(&body) {
                    request_builder = request_builder.body(json_str);
                }
            }
        }
    }

    // 发送请求
    let mut response = match request_builder.send().await {
        Ok(resp) => resp,
        Err(e) => {
            // 获取错误信息
            let error_msg = e.to_string();
            
            // 根据错误信息内容返回更友好的错误提示
            if error_msg.contains("URL") || error_msg.contains("url") {
                return Err(format!("无效的URL格式: {}", url));
            } else if error_msg.contains("JSON") || error_msg.contains("json") {
                return Err("JSON序列化/反序列化失败".to_string());
            } else if error_msg.contains("builder") || error_msg.contains("Builder") {
                return Err("构建请求时出错，请检查URL格式和请求参数".to_string());
            } else {
                return Err(format!("请求发送失败: {}", error_msg));
            }
        },
    };

    // 先获取状态码，避免生命周期问题
    let status = response.status().as_u16();

    // 提取响应头
    let mut response_headers = HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(value_str) = value.to_str() {
            response_headers.insert(key.to_string(), value_str.to_string());
        }
    }

    // 读取响应体
    let response_body = match response.text().await {
        Ok(body) => {
            // 尝试解析为JSON，如果失败则作为字符串返回
            match serde_json::from_str(&body) {
                Ok(json) => json,
                Err(_) => serde_json::Value::String(body),
            }
        },
        Err(e) => return Err(format!("读取响应失败: {}", e)),
    };

    // 返回响应
    Ok(HttpResponse {
        status,
        headers: response_headers,
        body: response_body,
    })
}
