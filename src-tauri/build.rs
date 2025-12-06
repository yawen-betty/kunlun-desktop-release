use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    // 仅在开发模式下复制 node
    let profile = env::var("PROFILE").unwrap_or_default();
    
    if profile == "debug" {
        let out_dir = env::var("OUT_DIR").unwrap();
        let target_dir = PathBuf::from(&out_dir)
            .parent()
            .and_then(|p| p.parent())
            .and_then(|p| p.parent())
            .unwrap()
            .to_path_buf();
        
        let binaries_dir = target_dir.join("binaries");
        fs::create_dir_all(&binaries_dir).ok();
        
        // 查找系统 node
        if let Ok(output) = std::process::Command::new("which").arg("node").output() {
            if output.status.success() {
                let node_path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                let dest = binaries_dir.join("node");
                
                // 复制或创建符号链接
                #[cfg(unix)]
                {
                    use std::os::unix::fs::symlink;
                    let _ = fs::remove_file(&dest);
                    symlink(&node_path, &dest).ok();
                    println!("cargo:warning=Created symlink: {:?} -> {:?}", dest, node_path);
                }
                
                #[cfg(windows)]
                {
                    fs::copy(&node_path, &dest).ok();
                    println!("cargo:warning=Copied node: {:?} -> {:?}", node_path, dest);
                }
            }
        }
    }
    
    tauri_build::build()
}
