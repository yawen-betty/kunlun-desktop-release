use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Runtime,
};

/// 创建系统托盘
pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    eprintln!("[Tray] Creating system tray...");
    // 创建托盘菜单
    let show_hide = MenuItem::with_id(app, "show_hide", "显示/隐藏", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_hide, &quit])?;

    // 创建托盘图标
    let mut tray_builder = TrayIconBuilder::new()
        .tooltip("昆仑")
        .menu(&menu);

    // 安全地设置图标
    if let Some(icon) = app.default_window_icon() {
        tray_builder = tray_builder.icon(icon.clone());
    }

    let _tray = tray_builder
        .menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            handle_tray_event(tray.app_handle(), event);
        })
        .on_menu_event(|app, event| {
            handle_menu_event(app, &event.id().as_ref());
        })
        .build(app)?;

    eprintln!("[Tray] System tray created successfully");
    Ok(())
}

/// 处理托盘图标事件
fn handle_tray_event<R: Runtime>(app: &AppHandle<R>, event: TrayIconEvent) {
    match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => {
            toggle_window_visibility(app);
        }
        _ => {}
    }
}

/// 处理托盘菜单事件
fn handle_menu_event<R: Runtime>(app: &AppHandle<R>, menu_id: &str) {
    match menu_id {
        "show_hide" => {
            toggle_window_visibility(app);
        }
        "quit" => {
            app.exit(0);
        }
        _ => {}
    }
}

/// 切换窗口显示/隐藏状态
fn toggle_window_visibility<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        // 如果窗口最小化，直接恢复并显示
        if window.is_minimized().unwrap_or(false) {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_focus();
        } else {
            // 否则根据可见性切换
            match window.is_visible() {
                Ok(true) => {
                    let _ = window.hide();
                }
                Ok(false) | Err(_) => {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        }
    }
}

/// 隐藏窗口到托盘
pub fn hide_to_tray<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
}
