# 昆仑桌面端 (Kunlun Desktop)

![Vue 3](https://img.shields.io/badge/Vue.js-3.x-green.svg) ![Tauri](https://img.shields.io/badge/Tauri-2.x-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg) ![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)

## 1. 项目简介

**昆仑桌面端** 是一个基于 [Tauri](https://tauri.app/) 和 [Vue 3](https://vuejs.org/) 构建的现代化、跨平台桌面应用程序。项目采用 TypeScript 提供类型安全，利用 Vite 实现快速的开发和构建，旨在提供高性能、接近原生的用户体验。

## 2. 核心特性

- **跨平台**: 一套代码库，可打包成 Windows、macOS 和 Linux 的原生应用。
- **现代化技术栈**: 全面拥抱 Vue 3 Composition API (`<script setup>`) 和 TypeScript。
- **高性能**: 基于 Rust 的 Tauri 后端，确保了应用的性能和安全性。
- **丰富的UI**: 结合 View UI Plus 组件库和自定义封装的全局组件，提供一致且美观的用户界面。
- **原生能力**: 通过 Tauri API 实现原生文件操作、系统通知、安全存储和全局快捷键等功能。
- **规范化开发**: 拥有完善的开发规范、组件文档和AI友好的代码结构。

## 3. 技术栈

- **核心框架**: Vue 3, Tauri 2.x
- **语言**: TypeScript 5.x, Rust
- **构建工具**: Vite 6.x
- **路由**: Vue Router 4.x
- **UI 库**: View UI Plus
- **CSS 预处理器**: SCSS

## 4. 本地开发指南

### 4.1 环境准备

在开始之前，请确保您的开发环境中已安装以下依赖：

1.  **Node.js**: `v18.x` 或更高版本。
2.  **Rust**: 通过 `rustup` 安装。请参考 [Rust 官方安装指南](https://www.rust-lang.org/tools/install)。
3.  **系统依赖**: 根据您的操作系统，需要安装相应的 WebView2 / WebKitGTK / Xcode 依赖。请参考 [Tauri 官方环境配置指南](https://tauri.app/v1/guides/getting-started/prerequisites)。

### 4.2 配置管理 (Configuration Management)

本项目采用 `AppConf.mts` 脚本结合 `package.json` 中的 `config` 对象来管理多环境配置。该脚本会根据当前环境变量生成 `src/Config.ts` 文件，供前端代码使用。

#### 4.2.1 配置项说明

以下是 `package.json` 中 `config` 字段下常用配置项的说明：

| 配置项 | 类型 | 描述 |
| :--- | :--- | :--- |
| `baseUrl` | `String` | API 请求的基础 URL。前端所有 API 请求都将以此为前缀。 |
| `basePath` | `String` | 应用部署的基础路径。用于路由配置或资源引用。 |

#### 4.2.2 各环境配置值

以下是 `package.json` 中定义的各环境基础配置的具体值：

| 环境 | `baseUrl` | `basePath` |
| :--- | :--- | :--- |
| `dev` | `http://mgt.crm.dev.pangu.cc/` | `/` |
| `test` | `https://test.liangjiyuren.cn/` | `/` |
| `prod` | `(生产环境请根据实际部署填写)` | `/` |

#### 4.2.3 生成特定环境配置

在启动项目或构建之前，您需要运行相应的 `config` 脚本来生成当前环境的配置文件。

| 命令 | 描述 |
| :--- | :--- | :--- |
| `npm run config:dev` | 生成开发环境配置 (`APP_ENV=dev`)。 |
| `npm run config:test` | 生成测试环境配置 (`APP_ENV=test`)。 |
| `npm run config:prod` | 生成生产环境配置 (`APP_ENV=prod`)。 |
| `npm run config` | 直接运行 `AppConf.mts`，不指定环境，通常不单独使用。 |

**示例:**

在开发模式下启动项目前，通常需要先生成开发环境配置：

```bash
npm run config:dev
npm run tauri dev
```

#### 4.2.4 注意事项

- `src/Config.ts` 文件是自动生成的，**请勿手动修改**。任何配置变更应在 `package.json` 的 `config` 字段或 `AppConf.mts` 中进行。
- 确保在切换开发环境（如从 `dev` 到 `test`）时，重新运行对应的 `config` 脚本。

### 4.3 项目启动

```bash
# 1. 克隆项目到本地

# 2. 进入项目目录
cd kunlun-desktop

# 3. 安装前端依赖
npm install

# 4. 启动桌面应用开发模式
npm run tauri dev
```

## 5. 可用命令

| 命令 | 描述 |
| :--- | :--- |
| `npm run dev` | 仅启动前端Web部分的开发服务器。 |
| `npm run build` | 仅构建用于生产环境的前端Web部分。 |
| `npm run tauri dev` | **(常用)** 启动桌面应用的开发模式，包含热重载。 |
| `npm run tauri build` | 构建用于生产环境的桌面应用程序安装包。 |

## 6. 项目结构

```
src/
├── api/            # API 请求模块 (按业务划分)
├── assets/         # 静态资源 (样式, 图片, 字体)
├── components/     # 全局公共组件
├── directive/      # 全局自定义指令
├── layouts/        # 页面布局组件
├── router/         # 路由配置
├── utiles/         # 工具函数与模块封装
├── views/          # 页面视图 (按业务划分)
├── App.vue         # 根组件
├── Config.ts       # 配置文件 (由 AppConf.mts 自动生成)
└── main.ts         # 应用入口文件
```

## 7. 开发规范

本项目拥有完整的前端开发规范，旨在提高代码质量、可维护性和团队协作效率。

**在开始开发前，请务必详细阅读位于 `/kunlun-docs/03.规范/01.前端/` 目录下的所有规范文档。**

- **[103_前端开发指南.md](../kunlun-docs/03.规范/01.前端/103_前端开发指南.md)** 是开始所有工作的入口。

## 8. IDE 推荐

- **VS Code**
- **必装插件**:
  - [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (提供 Vue 3 语法支持)
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
