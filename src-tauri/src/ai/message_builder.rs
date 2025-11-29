use super::types::Message;

/// 消息构建器
/// 
/// 用于构建 AI 对话的消息列表，支持链式调用
pub struct MessageBuilder {
    /// 消息列表
    messages: Vec<Message>,
}

impl MessageBuilder {
    /// 创建新的消息构建器
    pub fn new() -> Self {
        Self {
            messages: Vec::new(),
        }
    }
    
    /// 添加系统提示词（可选）
    /// 
    /// 系统提示词用于指导 AI 的行为，会被添加到消息列表的开头
    /// 
    /// # 参数
    /// * `prompt` - 系统提示词内容，如果为 None 则不添加
    pub fn with_system_prompt(mut self, prompt: Option<String>) -> Self {
        if let Some(content) = prompt {
            self.messages.push(Message {
                role: "system".to_string(),
                content: Some(content),
                tool_calls: None,
                tool_call_id: None,
                name: None,
            });
        }
        self
    }
    
    /// 添加用户消息
    /// 
    /// # 参数
    /// * `content` - 用户的任务描述或问题
    pub fn with_user_message(mut self, content: String) -> Self {
        self.messages.push(Message {
            role: "user".to_string(),
            content: Some(content),
            tool_calls: None,
            tool_call_id: None,
            name: None,
        });
        self
    }
    
    /// 构建并返回消息列表
    pub fn build(self) -> Vec<Message> {
        self.messages
    }
}

impl Default for MessageBuilder {
    fn default() -> Self {
        Self::new()
    }
}
