use tokio::time::{timeout, Duration};
use super::types::*;

/// API 超时时间（秒）
const API_TIMEOUT_SECS: u64 = 60;

/// 最大重试次数（用于处理限流等临时错误）
const MAX_RETRIES: usize = 2;

/// AI API 客户端
///
/// 负责与 AI 服务提供商（如智谱 AI）进行通信
/// 包含重试逻辑和错误处理
pub struct ApiClient {
    /// HTTP 客户端，用于发送请求
    http_client: reqwest::Client,
}

impl ApiClient {
    /// 创建新的 API 客户端
    pub fn new() -> Self {
      let client = reqwest::Client::builder()
              .pool_max_idle_per_host(0)
              .pool_idle_timeout(Duration::from_secs(0))
              .build()
              .unwrap();
        Self {
            http_client: client,
        }
    }

    /// 调用 AI API
    ///
    /// # 参数
    /// * `api_url` - API 地址
    /// * `api_key` - API 密钥
    /// * `model` - 模型名称
    /// * `messages` - 对话历史
    /// * `tools` - 可用的工具列表
    /// * `enable_thinking` - 是否启用 thinking
    ///
    /// # 返回
    /// AI 的响应消息，可能包含文本回复或工具调用请求
    ///
    /// # 错误处理
    /// - 网络超时：返回超时错误
    /// - API 限流（错误码 1305）：自动重试，最多 3 次
    /// - 其他错误：直接返回错误信息
    pub async fn call_api(
        &self,
        api_url: &str,
        api_key: &str,
        model: &str,
        messages: Vec<Message>,
        tools: Vec<Tool>,
        enable_thinking: bool,
    ) -> Result<ResponseMessage, String> {
        // 构建请求体
        let mut request_body = serde_json::json!({
            "model": model,
            "messages": messages,
            "tools": tools,
        });

        // 根据配置添加 thinking 设置
        if !enable_thinking {
            request_body["thinking"] = serde_json::json!({
                "type": "disabled"
            });
        }

        // 重试循环
        let mut retry_count = 0;

        loop {
            // 打印日志
            if retry_count > 0 {
                eprintln!("[API] 调用 API (重试 {}/{})", retry_count, MAX_RETRIES);
            } else {
                eprintln!("[API] 调用 API");
            }

            eprintln!("[API] 发送请求到: {}", api_url);
            eprintln!("[API] 消息数量: {}", messages.len());
            eprintln!("[API] 工具数量: {}", tools.len());

            // 发送 HTTP 请求（带超时）
            eprintln!("[API] 等待响应（超时{}秒）...", API_TIMEOUT_SECS);
            let response = timeout(Duration::from_secs(API_TIMEOUT_SECS), async {
                self.http_client
                    .post(api_url)
                    .header("Authorization", format!("Bearer {}", api_key))
                    .header("Content-Type", "application/json")
                    .json(&request_body)
                    .send()
                    .await
            })
            .await
            .map_err(|_| "API 调用超时".to_string())?
            .map_err(|e| format!("API 请求失败: {}", e))?;

            // 获取响应状态和内容
            let status = response.status();
            let text = response.text().await
                .map_err(|e| format!("读取响应失败: {}", e))?;

            // 检查 HTTP 状态码
            if !status.is_success() {
                eprintln!("[API] 错误响应: {}", text);

                // 检查是否是限流错误
                if self.is_rate_limit_error(&text) {
                    retry_count += 1;
                    if retry_count <= MAX_RETRIES {
                        // 快速重试：1秒、2秒
                        let wait_time = retry_count as u64;
                        eprintln!("[API] 遇到限流，等待 {} 秒后重试", wait_time);
                        tokio::time::sleep(Duration::from_secs(wait_time)).await;
                        continue;
                    }
                }

                return Err(format!("API 返回错误: {} - {}", status, text));
            }

            // 解析响应
            eprintln!("[API] 收到响应，开始解析...");
            let zhipu_response: ZhipuResponse = serde_json::from_str(&text)
                .map_err(|e| format!("解析响应失败: {} - 响应内容: {}", e, text))?;

            eprintln!("[API] 解析成功");
            return Ok(zhipu_response.choices[0].message.clone());
        }
    }

    /// 检查是否是限流错误
    ///
    /// # 参数
    /// * `error_text` - 错误响应文本
    ///
    /// # 返回
    /// 如果是限流错误返回 true，否则返回 false
    fn is_rate_limit_error(&self, error_text: &str) -> bool {
        error_text.contains("1305") || error_text.contains("请求过多")
    }
}

impl Default for ApiClient {
    fn default() -> Self {
        Self::new()
    }
}
