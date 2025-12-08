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
        
        // 根据平台选择正确的 node 文件
        let node_filename = if cfg!(target_os = "macos") {
            if cfg!(target_arch = "aarch64") {
                "node-aarch64-apple-darwin"
            } else {
                "node-x86_64-apple-darwin"
            }
        } else if cfg!(target_os = "windows") {
            "node-x86_64-pc-windows-msvc.exe"
        } else {
            "node" // fallback
        };
        
        let source = binaries_dir.join(node_filename);
        let dest = if cfg!(target_os = "windows") {
            binaries_dir.join("node.exe")
        } else {
            binaries_dir.join("node")
        };
        
        // 如果源文件存在，创建符号链接或复制
        if source.exists() {
            #[cfg(unix)]
            {
                use std::os::unix::fs::symlink;
                let _ = fs::remove_file(&dest);
                if let Ok(_) = symlink(&source, &dest) {
                    println!("cargo:warning=Created symlink: {:?} -> {:?}", dest, source);
                }
            }
            
            #[cfg(windows)]
            {
                let _ = fs::remove_file(&dest);
                if let Ok(_) = fs::copy(&source, &dest) {
                    println!("cargo:warning=Copied node: {:?} -> {:?}", source, dest);
                }
            }
        } else {
            println!("cargo:warning=Node file not found: {:?}", source);
        }
    }
    
    tauri_build::build()
}
