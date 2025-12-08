// AI 模块
// 
// 提供 AI 任务执行能力，支持与 MCP 工具集成
// 实现 AI Agent 的核心逻辑

mod types;
mod config;
mod message_builder;
mod api_client;
mod tool_executor;
mod manager;

pub use types::TaskResult;
pub use manager::AIManager;
pub use config::AITaskConfig;
