# 昆仑桌面端项目概述

## 技术栈
- **前端**: Vue 3 + TypeScript + Vite + View UI Plus
- **后端**: Tauri 2.x (Rust)
- **样式**: SCSS

## 项目结构
```
src/
├── api/            # API模块 (auth, agreement, config, system)
├── components/     # 全局组件 (addressSelect, ellipsis, svgIcon)
├── directive/      # 自定义指令 (clearableSelect, clickOutSide, trim)
├── views/          # 页面 (login, resume)
├── Config.ts       # 配置文件 (自动生成)
└── main.ts
```

## 核心模块
- **配置管理**: `AppConf.mts` → `Config.ts` (多环境: dev/test/prod)
- **HTTP客户端**: `api/HttpClient.ts` + `BaseDto.ts`
- **状态管理**: `SystemService.ts` + `enumDict.ts`

## 开发规范
- Vue 3 Composition API + `<script setup>`
- TypeScript 严格模式
- 统一的API请求/响应格式
- CSS变量 + 全局样式工具类

## 构建命令
```bash
npm run config:dev && npm run tauri dev    # 开发
npm run config:prod && npm run tauri build # 生产
```

## 应用配置
- 窗口: 最大化, 最小1366x768, 无边框
- 标识: com.yawen.tauri_test
