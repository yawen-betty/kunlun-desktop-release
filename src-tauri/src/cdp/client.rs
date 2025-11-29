use tokio_tungstenite::{connect_async, tungstenite::Message, WebSocketStream, MaybeTlsStream};
use tokio::net::TcpStream;
use futures_util::{SinkExt, StreamExt, stream::SplitSink, stream::SplitStream};
use serde_json::json;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock, mpsc};
use std::collections::HashMap;
use super::types::*;

pub struct CDPClient {
    ws_sender: Arc<Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>>,
    request_id: Arc<AtomicU32>,
    network_events: Arc<RwLock<Vec<NetworkEvent>>>,
    pending_responses: Arc<RwLock<HashMap<u32, tokio::sync::oneshot::Sender<Result<serde_json::Value, String>>>>>,
    attached_sessions: Arc<RwLock<HashMap<String, String>>>, // target_id -> session_id
    active_target_id: Arc<RwLock<Option<String>>>, // 当前活跃的 target_id
    #[allow(dead_code)]
    attach_tx: mpsc::UnboundedSender<String>, // 用于发送需要附加的 target_id
}

impl CDPClient {
    /// 连接到 CDP
    pub async fn connect(url: &str) -> Result<Self, String> {
        eprintln!("[CDP] Connecting to: {}", url);
        
        let (ws, _) = connect_async(url)
            .await
            .map_err(|e| format!("Failed to connect CDP: {}", e))?;
        
        eprintln!("[CDP] Connected successfully");
        
        let (ws_sender, ws_receiver) = ws.split();
        
        let network_events = Arc::new(RwLock::new(Vec::new()));
        let pending_responses: Arc<RwLock<HashMap<u32, tokio::sync::oneshot::Sender<Result<serde_json::Value, String>>>>> = Arc::new(RwLock::new(HashMap::new()));
        let ws_sender = Arc::new(Mutex::new(ws_sender));
        let request_id = Arc::new(AtomicU32::new(1));
        let attached_sessions = Arc::new(RwLock::new(HashMap::new()));
        let active_target_id = Arc::new(RwLock::new(None));
        let (attach_tx, mut attach_rx) = mpsc::unbounded_channel::<String>();
        
        // 启动附加处理任务
        let ws_sender_for_attach = ws_sender.clone();
        let request_id_for_attach = request_id.clone();
        let pending_responses_for_attach = pending_responses.clone();
        let attached_sessions_for_attach = attached_sessions.clone();
        
        tokio::spawn(async move {
            while let Some(target_id) = attach_rx.recv().await {
                eprintln!("[CDP] Attaching to new target: {}", target_id);
                
                // 发送 attachToTarget 命令
                let id = request_id_for_attach.fetch_add(1, Ordering::SeqCst);
                let (tx, rx) = tokio::sync::oneshot::channel();
                
                {
                    let mut responses = pending_responses_for_attach.write().await;
                    responses.insert(id, tx);
                }
                
                let request = CDPRequest {
                    id,
                    method: "Target.attachToTarget".to_string(),
                    params: json!({
                        "targetId": target_id,
                        "flatten": true
                    }),
                    session_id: None,
                };
                
                if let Ok(json) = serde_json::to_string(&request) {
                    let mut sender = ws_sender_for_attach.lock().await;
                    let _ = sender.send(Message::Text(json)).await;
                    
                    // 等待响应
                    if let Ok(Ok(Ok(result))) = tokio::time::timeout(
                        std::time::Duration::from_secs(5),
                        rx
                    ).await {
                        if let Some(session_id) = result["sessionId"].as_str() {
                            // 保存 session
                            {
                                let mut sessions = attached_sessions_for_attach.write().await;
                                sessions.insert(target_id.clone(), session_id.to_string());
                            }
                            
                            // 启用网络监听
                            let enable_id = request_id_for_attach.fetch_add(1, Ordering::SeqCst);
                            let enable_request = CDPRequest {
                                id: enable_id,
                                method: "Network.enable".to_string(),
                                params: json!({}),
                                session_id: Some(session_id.to_string()),
                            };
                            
                            if let Ok(json) = serde_json::to_string(&enable_request) {
                                let _ = sender.send(Message::Text(json)).await;
                                eprintln!("[CDP] Network enabled for new target: {}", target_id);
                            }
                        }
                    }
                }
            }
        });
        
        // 启动后台任务监听消息
        let network_events_for_listener = network_events.clone();
        let pending_responses_for_listener = pending_responses.clone();
        let ws_sender_for_listener = ws_sender.clone();
        let request_id_for_listener = request_id.clone();
        let attach_tx_for_listener = attach_tx.clone();
        let active_target_id_for_listener = active_target_id.clone();
        let attached_sessions_for_listener = attached_sessions.clone();
        tokio::spawn(async move {
            Self::message_listener(
                ws_receiver, 
                network_events_for_listener, 
                pending_responses_for_listener, 
                ws_sender_for_listener, 
                request_id_for_listener, 
                attach_tx_for_listener,
                active_target_id_for_listener,
                attached_sessions_for_listener
            ).await;
        });
        
        let client = Self {
            ws_sender,
            request_id,
            network_events,
            pending_responses,
            attached_sessions,
            active_target_id,
            attach_tx,
        };
        
        // 启用 Target 发现
        eprintln!("[CDP] Enabling target discovery...");
        client.send_command("Target.setDiscoverTargets", json!({"discover": true})).await?;
        
        // 附加到所有现有的页面 Targets
        eprintln!("[CDP] Attaching to existing targets...");
        match client.send_command("Target.getTargets", json!({})).await {
            Ok(result) => {
                if let Some(target_infos) = result["targetInfos"].as_array() {
                    let mut first_target_id: Option<String> = None;
                    for target in target_infos {
                        if target["type"].as_str() == Some("page") {
                            if let Some(target_id) = target["targetId"].as_str() {
                                if first_target_id.is_none() {
                                    first_target_id = Some(target_id.to_string());
                                }
                                if let Err(e) = client.attach_to_target(target_id).await {
                                    eprintln!("[CDP] Warning: Failed to attach to target {}: {}", target_id, e);
                                }
                            }
                        }
                    }
                    // 设置第一个 target 为活跃 target
                    if let Some(target_id) = first_target_id {
                        let mut active = client.active_target_id.write().await;
                        *active = Some(target_id.clone());
                        eprintln!("[CDP] Set active target: {}", target_id);
                    }
                }
            }
            Err(e) => eprintln!("[CDP] Warning: Failed to get targets: {}", e),
        }
        
        Ok(client)
    }
    
    /// 后台消息监听任务
    async fn message_listener(
        mut ws_receiver: SplitStream<WebSocketStream<MaybeTlsStream<TcpStream>>>,
        network_events: Arc<RwLock<Vec<NetworkEvent>>>,
        pending_responses: Arc<RwLock<HashMap<u32, tokio::sync::oneshot::Sender<Result<serde_json::Value, String>>>>>,
        ws_sender: Arc<Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>>,
        request_id: Arc<AtomicU32>,
        attach_tx: mpsc::UnboundedSender<String>,
        active_target_id: Arc<RwLock<Option<String>>>,
        attached_sessions: Arc<RwLock<HashMap<String, String>>>,
    ) {
        while let Some(msg) = ws_receiver.next().await {
            if let Ok(Message::Text(text)) = msg {
                // 尝试解析为响应
                if let Ok(response) = serde_json::from_str::<CDPResponse>(&text) {
                    let mut responses = pending_responses.write().await;
                    if let Some(sender) = responses.remove(&response.id) {
                        let result = if let Some(error) = response.error {
                            Err(format!("CDP error: {}", error.message))
                        } else {
                            Ok(response.result.unwrap_or(json!({})))
                        };
                        let _ = sender.send(result);
                    }
                }
                // 尝试解析为事件
                else if let Ok(event) = serde_json::from_str::<CDPEvent>(&text) {
                    Self::handle_event(
                        event, 
                        network_events.clone(), 
                        ws_sender.clone(), 
                        request_id.clone(), 
                        pending_responses.clone(), 
                        attach_tx.clone(),
                        active_target_id.clone(),
                        attached_sessions.clone()
                    ).await;
                }
            }
        }
        eprintln!("[CDP] Connection closed");
    }
    
    /// 附加到指定 Target
    async fn attach_to_target(&self, target_id: &str) -> Result<String, String> {
        eprintln!("[CDP] Attaching to target: {}", target_id);
        
        let result = self.send_command("Target.attachToTarget", json!({
            "targetId": target_id,
            "flatten": true
        })).await?;
        
        let session_id = result["sessionId"].as_str()
            .ok_or("No sessionId in response")?
            .to_string();
        
        // 保存 session 映射
        {
            let mut sessions = self.attached_sessions.write().await;
            sessions.insert(target_id.to_string(), session_id.clone());
        }
        
        // 为这个 session 启用网络监听
        self.send_command_with_session("Network.enable", json!({}), Some(session_id.clone())).await?;
        
        eprintln!("[CDP] Attached to target {} with session {}", target_id, session_id);
        Ok(session_id)
    }
    
    /// 处理 CDP 事件
    async fn handle_event(
        event: CDPEvent, 
        network_events: Arc<RwLock<Vec<NetworkEvent>>>,
        ws_sender: Arc<Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>>,
        request_id: Arc<AtomicU32>,
        pending_responses: Arc<RwLock<HashMap<u32, tokio::sync::oneshot::Sender<Result<serde_json::Value, String>>>>>,
        attach_tx: mpsc::UnboundedSender<String>,
        active_target_id: Arc<RwLock<Option<String>>>,
        attached_sessions: Arc<RwLock<HashMap<String, String>>>,
    ) {
        match event.method.as_str() {
            "Target.targetCreated" => {
                if let Some(target_info) = event.params["targetInfo"].as_object() {
                    if target_info["type"].as_str() == Some("page") {
                        if let Some(target_id) = target_info["targetId"].as_str() {
                            eprintln!("[CDP] New page target created: {}", target_id);
                            let _ = attach_tx.send(target_id.to_string());
                            
                            // 自动切换到新创建的 target
                            let mut active = active_target_id.write().await;
                            *active = Some(target_id.to_string());
                            eprintln!("[CDP] Auto-switched to new target: {}", target_id);
                        }
                    }
                }
            }
            "Target.targetDestroyed" => {
                if let Some(target_id) = event.params["targetId"].as_str() {
                    eprintln!("[CDP] Target destroyed: {}", target_id);
                    
                    // 从 attached_sessions 中移除
                    {
                        let mut sessions = attached_sessions.write().await;
                        sessions.remove(target_id);
                    }
                    
                    // 如果是当前活跃的 target，切换到第一个可用的
                    let mut active = active_target_id.write().await;
                    if active.as_ref() == Some(&target_id.to_string()) {
                        let sessions = attached_sessions.read().await;
                        if let Some((first_target_id, _)) = sessions.iter().next() {
                            *active = Some(first_target_id.clone());
                            eprintln!("[CDP] Auto-switched to target: {}", first_target_id);
                        } else {
                            *active = None;
                            eprintln!("[CDP] No active target available");
                        }
                    }
                }
            }
            "Network.responseReceived" => {
                if let Ok(response) = serde_json::from_value::<serde_json::Value>(event.params.clone()) {
                    let url = response["response"]["url"].as_str().unwrap_or("");
                    let resource_type = response["type"].as_str().unwrap_or("");
                    
                    // 只记录 XHR 和 Fetch 类型的请求（API 请求）
                    if resource_type == "XHR" || resource_type == "Fetch" {
                        let req_id = response["requestId"].as_str().unwrap_or("").to_string();
                        let url_str = url.to_string();
                        let status = response["response"]["status"].as_u64().map(|s| s as u16);
                        
                        // 检查是否已存在，避免重复
                        let mut events = network_events.write().await;
                        if !events.iter().any(|e| e.request_id == req_id) {
                            let network_event = NetworkEvent {
                                request_id: req_id.clone(),
                                url: url_str.clone(),
                                method: response["type"].as_str().unwrap_or("GET").to_string(),
                                status,
                                response_body: None,
                            };
                            events.push(network_event);
                        }
                    }
                }
            }
            "Network.loadingFinished" => {
                if let Ok(response) = serde_json::from_value::<serde_json::Value>(event.params.clone()) {
                    let req_id = response["requestId"].as_str().unwrap_or("").to_string();
                    let session_id = event.session_id.clone();
                    
                    // 检查是否是我们关心的请求
                    let should_fetch = {
                        let events = network_events.read().await;
                        events.iter().any(|e| e.request_id == req_id)
                    };
                    
                    if should_fetch {
                        let network_events_clone = network_events.clone();
                        let ws_sender_clone = ws_sender.clone();
                        let request_id_clone = request_id.clone();
                        let pending_responses_clone = pending_responses.clone();
                        let req_id_clone = req_id.clone();
                        
                        tokio::spawn(async move {
                            if let Some(body) = Self::fetch_response_body_with_session(
                                &req_id_clone,
                                session_id,
                                ws_sender_clone,
                                request_id_clone,
                                pending_responses_clone
                            ).await {
                                let mut events = network_events_clone.write().await;
                                if let Some(event) = events.iter_mut().find(|e| e.request_id == req_id_clone) {
                                    event.response_body = Some(body);
                                }
                            }
                        });
                    }
                }
            }
            _ => {}
        }
    }
    
    /// 获取响应体（带 session_id）
    async fn fetch_response_body_with_session(
        request_id: &str,
        session_id: Option<String>,
        ws_sender: Arc<Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>>,
        id_counter: Arc<AtomicU32>,
        pending_responses: Arc<RwLock<HashMap<u32, tokio::sync::oneshot::Sender<Result<serde_json::Value, String>>>>>,
    ) -> Option<String> {
        for attempt in 1..=2 {
            let id = id_counter.fetch_add(1, Ordering::SeqCst);
            let (tx, rx) = tokio::sync::oneshot::channel();
            
            // 注册响应处理器
            {
                let mut responses = pending_responses.write().await;
                responses.insert(id, tx);
            }
            
            let request = CDPRequest {
                id,
                method: "Network.getResponseBody".to_string(),
                params: json!({"requestId": request_id}),
                session_id: session_id.clone(),
            };
            
            let request_json = match serde_json::to_string(&request) {
                Ok(json) => json,
                Err(_) => return None,
            };
            
            // 发送请求
            {
                let mut sender = ws_sender.lock().await;
                if sender.send(Message::Text(request_json)).await.is_err() {
                    return None;
                }
            }
            
            // 等待响应（超时 5 秒）
            match tokio::time::timeout(std::time::Duration::from_secs(5), rx).await {
                Ok(Ok(Ok(result))) => {
                    if let Some(body) = result["body"].as_str() {
                        return Some(body.to_string());
                    }
                }
                Ok(Ok(Err(_))) => {
                    if attempt < 2 {
                        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
                        continue;
                    }
                }
                _ => {
                    if attempt < 2 {
                        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
                        continue;
                    }
                }
            }
        }
        
        None
    }
    
    /// 发送 CDP 命令
    pub async fn send_command(&self, method: &str, params: serde_json::Value) -> Result<serde_json::Value, String> {
        self.send_command_with_session(method, params, None).await
    }
    
    /// 发送 CDP 命令（带 sessionId）
    async fn send_command_with_session(&self, method: &str, params: serde_json::Value, session_id: Option<String>) -> Result<serde_json::Value, String> {
        let id = self.request_id.fetch_add(1, Ordering::SeqCst);
        
        let (tx, rx) = tokio::sync::oneshot::channel();
        
        // 注册响应处理器
        {
            let mut responses = self.pending_responses.write().await;
            responses.insert(id, tx);
        }
        
        let request = CDPRequest {
            id,
            method: method.to_string(),
            params,
            session_id,
        };
        
        let request_json = serde_json::to_string(&request)
            .map_err(|e| format!("Failed to serialize request: {}", e))?;
        
        // 发送请求
        {
            let mut sender = self.ws_sender.lock().await;
            sender.send(Message::Text(request_json))
                .await
                .map_err(|e| format!("Failed to send message: {}", e))?;
        }
        
        // 等待响应（超时 30 秒）
        eprintln!("[CDP] Waiting for response id: {}", id);
        match tokio::time::timeout(std::time::Duration::from_secs(30), rx).await {
            Ok(Ok(result)) => result,
            Ok(Err(_)) => Err("Response channel closed".to_string()),
            Err(_) => {
                // 超时，清理响应处理器
                eprintln!("[CDP] Request {} timeout after 30s", id);
                let mut responses = self.pending_responses.write().await;
                responses.remove(&id);
                Err("Request timeout".to_string())
            }
        }
    }
    
    /// 执行 JavaScript
    pub async fn execute_script(&self, script: &str) -> Result<serde_json::Value, String> {
        // 获取当前活跃 target 的 session
        let session_id = self.get_active_session().await?;
        
        self.send_command_with_session("Runtime.evaluate", json!({
            "expression": script,
            "returnByValue": true,
            "awaitPromise": true
        }), Some(session_id)).await
    }
    
    /// 获取当前活跃的 session
    async fn get_active_session(&self) -> Result<String, String> {
        let active_target = self.active_target_id.read().await;
        
        if let Some(target_id) = active_target.as_ref() {
            let sessions = self.attached_sessions.read().await;
            if let Some(session_id) = sessions.get(target_id) {
                return Ok(session_id.clone());
            }
        }
        
        // 如果没有活跃 target，使用第一个可用的
        let sessions = self.attached_sessions.read().await;
        if let Some((_, session_id)) = sessions.iter().next() {
            return Ok(session_id.clone());
        }
        
        Err("No active session available".to_string())
    }
    
    /// 获取 Cookies
    pub async fn get_cookies(&self) -> Result<Vec<Cookie>, String> {
        // 获取当前活跃 target 的 session
        let session_id = self.get_active_session().await?;
        
        // 使用 Network.getCookies 而不是 Storage.getCookies
        let result = self.send_command_with_session("Network.getCookies", json!({}), Some(session_id)).await?;
        
        let cookies: Vec<Cookie> = serde_json::from_value(result["cookies"].clone())
            .map_err(|e| format!("Failed to parse cookies: {}", e))?;
        
        Ok(cookies)
    }
    
    /// 启用网络监听（为所有已附加的 session 启用）
    pub async fn enable_network(&self) -> Result<(), String> {
        let sessions = self.attached_sessions.read().await;
        
        if sessions.is_empty() {
            eprintln!("[CDP] No attached sessions, network monitoring will be enabled when targets are attached");
            return Ok(());
        }
        
        for (target_id, session_id) in sessions.iter() {
            match self.send_command_with_session("Network.enable", json!({}), Some(session_id.clone())).await {
                Ok(_) => eprintln!("[CDP] Network monitoring enabled for target {}", target_id),
                Err(e) => eprintln!("[CDP] Warning: Failed to enable network for target {}: {}", target_id, e),
            }
        }
        
        Ok(())
    }
    
    /// 获取网络事件
    pub async fn get_network_events(&self) -> Vec<NetworkEvent> {
        let events = self.network_events.read().await;
        events.clone()
    }
    
    /// 清除网络事件
    pub async fn clear_network_events(&self) {
        let mut events = self.network_events.write().await;
        events.clear();
    }
    
    /// 设置 Cookie
    pub async fn set_cookie(&self, params: serde_json::Value) -> Result<serde_json::Value, String> {
        // 获取当前活跃 target 的 session
        let session_id = self.get_active_session().await?;
        
        self.send_command_with_session("Network.setCookie", params, Some(session_id)).await
    }
    
    /// 获取指定请求的响应体
    pub async fn get_response_body(&self, request_id: &str) -> Result<String, String> {
        eprintln!("[CDP] Getting response body for request: {}", request_id);
        
        match self.send_command("Network.getResponseBody", json!({
            "requestId": request_id
        })).await {
            Ok(result) => {
                eprintln!("[CDP] Response body result: {:?}", result);
                result["body"].as_str()
                    .map(|s| s.to_string())
                    .ok_or_else(|| "No response body in result".to_string())
            }
            Err(e) => {
                eprintln!("[CDP] Failed to get response body: {}", e);
                Err(e)
            }
        }
    }
}
