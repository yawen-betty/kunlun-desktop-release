# Tauri + Vue + TypeScript

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)


```shell
npm run tauri dev
```

## 目录结构

```
├── AppConf.mts
├── README.md
├── README_DETAILED.md
├── index.html
├── package.json
├── public               # 存放直接复制到dist根目录的静态资源
│   ├── tauri.svg
│   └── vite.svg
├── src                  # 项目核心源代码
│   ├── App.vue
│   ├── Config.ts
│   ├── main.ts
│   ├── vite-env.d.ts
│   ├── api              # API原子请求模块
│   │   ├── BaseDto.ts
│   │   ├── HttpClient.ts
│   │   └── Path.ts
│   ├── assets           # 全局静态资源 (图片, 字体, 样式)
│   │   ├── fonts
│   │   ├── images
│   │   ├── styles
│   │   └── svg
│   ├── components       # 全局公共组件
│   │   ├── addressSelect
│   │   ├── ellipsis
│   │   └── svgIcon
│   ├── directive        # 全局自定义Vue指令
│   │   ├── clearableSelect.ts
│   │   ├── clickOutSide.ts
│   │   ├── index.ts
│   │   └── trim.ts
│   ├── enums            # 全局枚举和转换函数
│   │   └── enumDict.ts
│   ├── layouts          # 页面布局组件
│   │   ├── components
│   │   ├── index.vue
│   │   └── onlyHeader.vue
│   ├── router           # 路由配置
│   │   ├── index.ts
│   │   └── routers.ts
│   ├── service          # 业务逻辑服务层
│   │   ├── AgreementService.ts
│   │   ├── AuthService.ts
│   │   ├── ConfigService.ts
│   │   └── SystemService.ts
│   ├── utiles           # 全局工具函数
│   │   ├── logger.ts
│   │   ├── systemInfo.ts
│   │   ├── tauriCommonds.ts
│   │   └── userInfo.ts
│   └── views            # 页面视图
│       ├── login
│       └── resume
├── src-tauri            # Tauri 后端 (Rust) 代码
│   ├── Cargo.toml
│   ├── build.rs
│   ├── capabilities
│   ├── icons
│   ├── src
│   │   ├── commands     # Tauri 指令 (暴露给前端)
│   │   ├── lib.rs
│   │   └── main.rs
│   └── tauri.conf.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
