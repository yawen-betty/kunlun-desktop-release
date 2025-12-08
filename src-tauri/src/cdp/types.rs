use serde::{Deserialize, Serialize};

/// CDP 请求
#[derive(Debug, Serialize)]
pub struct CDPRequest {
    pub id: u32,
    pub method: String,
    pub params: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "sessionId")]
    pub session_id: Option<String>,
}

/// CDP 响应
#[derive(Debug, Deserialize)]
pub struct CDPResponse {
    pub id: u32,
    #[serde(default)]
    pub result: Option<serde_json::Value>,
    #[serde(default)]
    pub error: Option<CDPError>,
}

/// CDP 错误
#[derive(Debug, Deserialize)]
pub struct CDPError {
    #[allow(dead_code)]
    pub code: i32,
    pub message: String,
}

/// CDP 事件
#[derive(Debug, Deserialize)]
pub struct CDPEvent {
    pub method: String,
    pub params: serde_json::Value,
    #[serde(default)]
    #[serde(rename = "sessionId")]
    pub session_id: Option<String>,
}

/// Cookie
#[derive(Debug, Serialize, Deserialize)]
pub struct Cookie {
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
}

/// 网络事件
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkEvent {
    pub request_id: String,
    pub url: String,
    pub method: String,
    #[serde(default)]
    pub status: Option<u16>,
    #[serde(default)]
    pub response_body: Option<String>,
}
