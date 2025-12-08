/// AI 任务配置
///
/// 用于配置 AI 任务的执行参数，包括 API 密钥、调用地址、超时时间等
#[derive(Debug, Clone)]
pub struct AITaskConfig {
    /// API 密钥，用于身份验证
    pub api_key: String,

    /// API 调用地址（支持不同的 AI 服务提供商）
    pub api_url: String,

    /// 最大迭代次数，防止无限循环
    /// 每次 AI 调用算一次迭代
    pub max_iterations: usize,

    /// 任务超时时间（秒）
    /// 超过此时间任务将被强制终止
    pub timeout_secs: u64,

    /// 系统提示词（可选）
    /// 用于指导 AI 的行为和策略
    pub system_prompt: Option<String>,

    /// AI 模型名称
    pub model: String,

    /// 是否启用 thinking（思考过程）
    pub enable_thinking: bool,
}

impl Default for AITaskConfig {
    /// 创建默认配置
    ///
    /// 默认值：
    /// - api_url: 智谱 AI 的 API 地址
    /// - max_iterations: 10 次
    /// - timeout_secs: 600 秒（10 分钟）
    fn default() -> Self {
        Self {
            api_key: String::new(),
            api_url: "https://open.bigmodel.cn/api/paas/v4/chat/completions".to_string(),
            max_iterations: 20,
            timeout_secs: 300,
            system_prompt: None,
            model: "glm-4.5-flash".to_string(),
            enable_thinking: false,
        }
    }
}

impl AITaskConfig {
    /// 创建新的配置（使用默认值）
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            ..Default::default()
        }
    }

    /// 设置 API 地址
    #[allow(dead_code)]
    pub fn with_api_url(mut self, url: String) -> Self {
        self.api_url = url;
        self
    }

    /// 设置最大迭代次数
    #[allow(dead_code)]
    pub fn with_max_iterations(mut self, max: usize) -> Self {
        self.max_iterations = max;
        self
    }

    /// 设置系统提示词
    #[allow(dead_code)]
    pub fn with_system_prompt(mut self, prompt: String) -> Self {
        self.system_prompt = Some(prompt);
        self
    }

    /// 设置模型名称
    #[allow(dead_code)]
    pub fn with_model(mut self, model: String) -> Self {
        self.model = model;
        self
    }

    /// 设置是否启用 thinking
    #[allow(dead_code)]
    pub fn with_thinking(mut self, enable: bool) -> Self {
        self.enable_thinking = enable;
        self
    }
}
