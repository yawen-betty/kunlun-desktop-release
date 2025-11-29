use tauri::{AppHandle, State};
use tokio::sync::Mutex;
use std::sync::Arc;
use crate::ai::{AIManager, TaskResult, AITaskConfig};

#[tauri::command]
pub async fn ai_execute_task(
    app: AppHandle,
    api_key: String,
    task: String,
    state: State<'_, Arc<Mutex<AIManager>>>,
) -> Result<TaskResult, String> {
    let manager = state.lock().await;
    manager.execute_task(api_key, task, &app).await
}

#[tauri::command]
pub async fn ai_execute_task_with_config(
    app: AppHandle,
    api_key: String,
    task: String,
    api_url: Option<String>,
    model: Option<String>,
    enable_thinking: Option<bool>,
    state: State<'_, Arc<Mutex<AIManager>>>,
) -> Result<TaskResult, String> {
    let mut config = AITaskConfig::new(api_key);
    
    if let Some(url) = api_url {
        config = config.with_api_url(url);
    }
    
    if let Some(m) = model {
        config = config.with_model(m);
    }
    
    if let Some(thinking) = enable_thinking {
        config = config.with_thinking(thinking);
    }
    
    let manager = state.lock().await;
    manager.execute_task_with_config(task, config, &app).await
}

#[tauri::command]
pub fn ai_stop_task(
    state: State<'_, Arc<Mutex<AIManager>>>,
) -> Result<(), String> {
    let manager = state.blocking_lock();
    manager.stop_task();
    Ok(())
}
