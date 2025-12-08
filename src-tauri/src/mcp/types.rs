use serde::{Deserialize, Serialize};

/// 浏览器安装状态
#[derive(Debug, Serialize, Deserialize)]
pub struct BrowserStatus {
    pub installed: bool,
    pub path: Option<String>,
}
