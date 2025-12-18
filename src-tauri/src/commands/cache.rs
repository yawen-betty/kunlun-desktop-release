use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct CacheInfo {
    pub temp_cache_size: u64,
    pub playwright_temp_size: u64,
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
pub fn get_cache_size(app: tauri::AppHandle) -> Result<CacheInfo, String> {

    let mut info = CacheInfo {
        temp_cache_size: 0,
        playwright_temp_size: 0,
        total_size: 0,
    };

    // 1. 应用临时缓存
    if let Some(cache_dir) = get_app_cache_dir(&app) {
        info.temp_cache_size = calculate_dir_size(&cache_dir);
    }

    // 2. playwright缓存
    let temp_dir = std::env::temp_dir();
    eprintln!("[Cache] 系统临时目录: {:?}", temp_dir);
    info.playwright_temp_size = calculate_playwright_temp_size(&temp_dir);
    info.total_size = info.temp_cache_size + info.playwright_temp_size;


    Ok(info)
}

/// 清理缓存
#[tauri::command]
pub fn clear_cache(app: tauri::AppHandle) -> Result<ClearResult, String> {
    let mut result = ClearResult {
        success: true,
        freed_space: 0,
        errors: Vec::new(),
    };

    // 1. 清理应用临时缓存
    if let Some(cache_dir) = get_app_cache_dir(&app) {
        match clear_directory(&cache_dir) {
            Ok(size) => result.freed_space += size,
            Err(e) => {
                result.success = false;
                result.errors.push(format!("清理临时缓存失败: {}", e));
            }
        }
    }

    // 2. 清理playwright缓存
    let temp_dir = std::env::temp_dir();
    match clear_playwright_temp(&temp_dir) {
        Ok(size) => result.freed_space += size,
        Err(e) => {
            result.success = false;
            result.errors.push(format!("清理 Playwright 临时目录失败: {}", e));
        }
    }

    Ok(result)
}

// ============ 辅助函数 ============

/// 获取应用缓存目录
fn get_app_cache_dir(app: &tauri::AppHandle) -> Option<PathBuf> {
    let cache_dir = app.path().cache_dir().ok()?;
    let app_cache = cache_dir.join("com.liangji.kunlun");

    if app_cache.exists() {
        Some(app_cache)
    } else {
        None
    }
}

/// 计算缓存目录大小
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

/// 清理缓存目录（删除目录内所有内容，但保留目录本身）
/// 遇到被占用的文件会跳过，继续清理其他文件
fn clear_directory(dir: &PathBuf) -> Result<u64, String> {
    let mut freed_space = 0u64;
    let mut skipped_count = 0;

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

            // 尝试删除，失败则跳过
            let delete_result = if path.is_file() {
                fs::remove_file(&path)
            } else if path.is_dir() {
                fs::remove_dir_all(&path)
            } else {
                continue;
            };

            match delete_result {
                Ok(_) => {
                    freed_space += size;
                }
                Err(e) => {
                    // 跳过被占用的文件，继续清理其他文件
                    eprintln!("[Cache] 跳过文件（被占用）: {:?} - {}", path, e);
                    skipped_count += 1;
                }
            }
        }
    }

    if skipped_count > 0 {
        eprintln!("[Cache] 跳过了 {} 个被占用的文件", skipped_count);
    }

    Ok(freed_space)
}

/// 计算 Playwright 临时目录大小（只计算 playwright-* 目录）
fn calculate_playwright_temp_size(temp_dir: &PathBuf) -> u64 {
    let mut total_size = 0u64;

    if let Ok(entries) = fs::read_dir(temp_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(name) = path.file_name() {
                if let Some(name_str) = name.to_str() {
                    // 只计算 playwright- 开头的目录
                    if name_str.starts_with("playwright") && path.is_dir() {
                        total_size += calculate_dir_size(&path);
                    }
                }
            }
        }
    }

    total_size
}

/// 清理 Playwright 临时目录（只清理 playwright-* 目录）
fn clear_playwright_temp(temp_dir: &PathBuf) -> Result<u64, String> {
    let mut freed_space = 0u64;
    let mut skipped_count = 0;

    if let Ok(entries) = fs::read_dir(temp_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(name) = path.file_name() {
                if let Some(name_str) = name.to_str() {
                    // 只删除 playwright- 开头的目录
                    if name_str.starts_with("playwright") && path.is_dir() {
                        let size = calculate_dir_size(&path);

                        match fs::remove_dir_all(&path) {
                            Ok(_) => {
                                freed_space += size;
                                eprintln!("[Cache] 清理 Playwright 临时目录: {}", name_str);
                            }
                            Err(e) => {
                                eprintln!("[Cache] 跳过 {}（被占用）: {}", name_str, e);
                                skipped_count += 1;
                            }
                        }
                    }
                }
            }
        }
    }

    if skipped_count > 0 {
        eprintln!("[Cache] 跳过了 {} 个被占用的 Playwright 临时目录", skipped_count);
    }

    Ok(freed_space)
}
