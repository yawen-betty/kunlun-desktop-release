use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
pub struct CacheInfo {
    pub playwright_profile_size: u64,
    pub output_files_size: u64,
    pub temp_cache_size: u64,
    pub old_logs_size: u64,
    pub total_size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClearResult {
    pub success: bool,
    pub freed_space: u64,
    pub errors: Vec<String>,
}

/// 获取缓存大小
#[tauri::command]
pub fn get_cache_size() -> Result<CacheInfo, String> {
    let mut info = CacheInfo {
        playwright_profile_size: 0,
        output_files_size: 0,
        temp_cache_size: 0,
        old_logs_size: 0,
        total_size: 0,
    };

    // 1. Playwright Profile 缓存（只计算 mcp-*-profile 目录）
    if let Some(playwright_cache) = get_playwright_cache_dir() {
        info.playwright_profile_size = calculate_playwright_profiles_size(&playwright_cache);
    }

    // 2. Playwright 输出文件（假设在应用缓存目录下的 playwright-output）
    if let Some(cache_dir) = get_app_cache_dir() {
        let output_dir = cache_dir.join("playwright-output");
        if output_dir.exists() {
            info.output_files_size = calculate_dir_size(&output_dir);
        }
    }

    // 3. 应用临时缓存
    if let Some(cache_dir) = get_app_cache_dir() {
        info.temp_cache_size = calculate_dir_size(&cache_dir);
    }

    // 4. 旧日志文件（7天前）
    if let Some(log_dir) = get_app_log_dir() {
        info.old_logs_size = calculate_old_logs_size(&log_dir, 7);
    }

    info.total_size = info.playwright_profile_size
        + info.output_files_size
        + info.temp_cache_size
        + info.old_logs_size;

    Ok(info)
}

/// 清理缓存
#[tauri::command]
pub fn clear_cache() -> Result<ClearResult, String> {
    let mut result = ClearResult {
        success: true,
        freed_space: 0,
        errors: Vec::new(),
    };

    // 1. 清理 Playwright Profile 缓存
    if let Some(playwright_cache) = get_playwright_cache_dir() {
        match clear_playwright_profiles(&playwright_cache) {
            Ok(size) => result.freed_space += size,
            Err(e) => {
                result.success = false;
                result.errors.push(format!("清理 Playwright Profile 失败: {}", e));
            }
        }
    }

    // 2. 清理 Playwright 输出文件
    if let Some(cache_dir) = get_app_cache_dir() {
        let output_dir = cache_dir.join("playwright-output");
        if output_dir.exists() {
            match clear_directory(&output_dir) {
                Ok(size) => result.freed_space += size,
                Err(e) => {
                    result.success = false;
                    result.errors.push(format!("清理输出文件失败: {}", e));
                }
            }
        }
    }

    // 3. 清理应用临时缓存
    if let Some(cache_dir) = get_app_cache_dir() {
        match clear_directory(&cache_dir) {
            Ok(size) => result.freed_space += size,
            Err(e) => {
                result.success = false;
                result.errors.push(format!("清理临时缓存失败: {}", e));
            }
        }
    }

    // 4. 清理旧日志
    if let Some(log_dir) = get_app_log_dir() {
        match clear_old_logs(&log_dir, 7) {
            Ok(size) => result.freed_space += size,
            Err(e) => {
                result.success = false;
                result.errors.push(format!("清理旧日志失败: {}", e));
            }
        }
    }

    Ok(result)
}

// ============ 辅助函数 ============

/// 获取 Playwright 缓存目录
fn get_playwright_cache_dir() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    
    #[cfg(target_os = "macos")]
    let cache_dir = home.join("Library/Caches/ms-playwright");
    
    #[cfg(target_os = "windows")]
    let cache_dir = home.join("AppData/Local/ms-playwright");
    
    #[cfg(target_os = "linux")]
    let cache_dir = home.join(".cache/ms-playwright");
    
    if cache_dir.exists() {
        Some(cache_dir)
    } else {
        None
    }
}

/// 获取应用缓存目录
fn get_app_cache_dir() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    
    #[cfg(target_os = "macos")]
    let cache_dir = home.join("Library/Caches/com.liangji.kunlun");
    
    #[cfg(target_os = "windows")]
    let cache_dir = home.join("AppData/Local/com.liangji.kunlun");
    
    #[cfg(target_os = "linux")]
    let cache_dir = home.join(".cache/com.liangji.kunlun");
    
    if cache_dir.exists() {
        Some(cache_dir)
    } else {
        None
    }
}

/// 获取应用日志目录
fn get_app_log_dir() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    
    #[cfg(target_os = "macos")]
    let log_dir = home.join("Library/Logs/com.liangji.kunlun");
    
    #[cfg(target_os = "windows")]
    let log_dir = home.join("AppData/Roaming/com.liangji.kunlun/logs");
    
    #[cfg(target_os = "linux")]
    let log_dir = home.join(".config/com.liangji.kunlun/logs");
    
    if log_dir.exists() {
        Some(log_dir)
    } else {
        None
    }
}

/// 计算目录大小
fn calculate_dir_size(path: &PathBuf) -> u64 {
    let mut total_size = 0u64;
    
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    total_size += metadata.len();
                } else if metadata.is_dir() {
                    total_size += calculate_dir_size(&entry.path());
                }
            }
        }
    }
    
    total_size
}

/// 计算旧日志大小（指定天数前的）
fn calculate_old_logs_size(log_dir: &PathBuf, days: u64) -> u64 {
    let mut total_size = 0u64;
    let cutoff_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        - (days * 24 * 60 * 60);
    
    if let Ok(entries) = fs::read_dir(log_dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    if let Ok(modified) = metadata.modified() {
                        if let Ok(duration) = modified.duration_since(UNIX_EPOCH) {
                            if duration.as_secs() < cutoff_time {
                                total_size += metadata.len();
                            }
                        }
                    }
                }
            }
        }
    }
    
    total_size
}

/// 计算 Playwright Profile 目录大小（只计算 mcp-*-profile）
fn calculate_playwright_profiles_size(playwright_dir: &PathBuf) -> u64 {
    let mut total_size = 0u64;
    
    if let Ok(entries) = fs::read_dir(playwright_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(name) = path.file_name() {
                if let Some(name_str) = name.to_str() {
                    // 只计算 mcp-*-profile 目录
                    if name_str.starts_with("mcp-") && name_str.ends_with("-profile") {
                        if path.is_dir() {
                            total_size += calculate_dir_size(&path);
                        }
                    }
                }
            }
        }
    }
    
    total_size
}

/// 清理 Playwright Profile 目录（只清理 mcp-*-profile）
fn clear_playwright_profiles(playwright_dir: &PathBuf) -> Result<u64, String> {
    let mut freed_space = 0u64;
    
    if let Ok(entries) = fs::read_dir(playwright_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(name) = path.file_name() {
                if let Some(name_str) = name.to_str() {
                    // 只删除 mcp-*-profile 目录
                    if name_str.starts_with("mcp-") && name_str.ends_with("-profile") {
                        if path.is_dir() {
                            let size = calculate_dir_size(&path);
                            if let Err(e) = fs::remove_dir_all(&path) {
                                return Err(format!("删除 {} 失败: {}", name_str, e));
                            }
                            freed_space += size;
                        }
                    }
                }
            }
        }
    }
    
    Ok(freed_space)
}

/// 清理目录（删除目录内所有内容，但保留目录本身）
fn clear_directory(dir: &PathBuf) -> Result<u64, String> {
    let mut freed_space = 0u64;
    
    if !dir.exists() {
        return Ok(0);
    }
    
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            let size = if path.is_file() {
                if let Ok(metadata) = fs::metadata(&path) {
                    metadata.len()
                } else {
                    0
                }
            } else {
                calculate_dir_size(&path)
            };
            
            if path.is_file() {
                if let Err(e) = fs::remove_file(&path) {
                    return Err(format!("删除文件失败: {}", e));
                }
            } else if path.is_dir() {
                if let Err(e) = fs::remove_dir_all(&path) {
                    return Err(format!("删除目录失败: {}", e));
                }
            }
            
            freed_space += size;
        }
    }
    
    Ok(freed_space)
}

/// 清理旧日志
fn clear_old_logs(log_dir: &PathBuf, days: u64) -> Result<u64, String> {
    let mut freed_space = 0u64;
    let cutoff_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        - (days * 24 * 60 * 60);
    
    if let Ok(entries) = fs::read_dir(log_dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    if let Ok(modified) = metadata.modified() {
                        if let Ok(duration) = modified.duration_since(UNIX_EPOCH) {
                            if duration.as_secs() < cutoff_time {
                                let size = metadata.len();
                                if let Err(e) = fs::remove_file(entry.path()) {
                                    return Err(format!("删除日志文件失败: {}", e));
                                }
                                freed_space += size;
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(freed_space)
}
