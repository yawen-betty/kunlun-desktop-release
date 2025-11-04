# 昆仑桌面应用项目使用文档

## 项目目录结构

昆仑桌面应用采用模块化的目录结构，清晰分离了前端和Tauri后端代码，便于维护和扩展。

```
├── .gitignore             # Git忽略文件配置
├── AppConf.mts           # 应用配置文件
├── README.md             # 项目说明文档
├── README_DETAILED.md    # 详细使用文档
├── index.html            # HTML入口文件
├── package.json          # 前端依赖配置
├── public/               # 静态资源目录
│   ├── tauri.svg         # Tauri默认图标
│   └── vite.svg          # Vite默认图标
├── src-tauri/            # Tauri后端代码目录
│   ├── .gitignore        # Git忽略配置
│   ├── Cargo.lock        # Rust依赖锁定文件
│   ├── Cargo.toml        # Rust项目配置
│   ├── build.rs          # 构建脚本
│   ├── capabilities/     # Tauri权限配置
│   │   └── default.json  # 默认权限配置
│   ├── gen/              # 生成的代码
│   ├── icons/            # 应用图标资源
│   ├── src/              # Rust源代码
│   │   ├── commands/     # Tauri命令实现
│   │   ├── lib.rs        # 库代码和命令注册
│   │   └── main.rs       # 应用入口点
│   └── tauri.conf.json   # Tauri应用配置
├── src/                  # 前端源代码目录
│   ├── App.vue           # Vue根组件
│   ├── Config.ts         # 应用配置文件
│   ├── api/              # API接口定义和调用
│   ├── assets/           # 静态资源（样式、SVG等）
│   ├── components/       # 全局组件
│   ├── directive/        # 自定义指令
│   ├── layouts/          # 页面布局组件
│   ├── main.ts           # 应用入口文件
│   ├── router/           # 路由配置
│   ├── utiles/           # 工具函数
│   ├── views/            # 页面组件
│   └── vite-env.d.ts     # Vite环境类型声明
├── tsconfig.json         # TypeScript配置
├── tsconfig.node.json    # Node环境TypeScript配置
└── vite.config.ts        # Vite构建配置
```

### 主要目录说明

- **src/**：前端Vue应用的主要代码目录
- **src-tauri/**：Tauri桌面应用后端Rust代码
- **public/**：公共静态资源，不会被构建工具处理
- **src/api/**：HTTP接口定义、数据传输对象和请求工具
- **src/assets/**：CSS样式文件和SVG图标等资源
- **src/components/**：可复用的全局Vue组件
- **src/directive/**：自定义Vue指令
- **src/layouts/**：页面布局模板
- **src/router/**：Vue Router路由配置
- **src/utiles/**：公共工具函数和类
- **src/views/**：页面组件和业务逻辑

## 1. HTTP接口规范（src/api目录）

### 1.1 接口定义规范

昆仑应用采用了结构化的HTTP接口定义方式，主要包含以下几个核心文件：

#### BaseDto.ts - 数据传输对象基类
定义了接口请求和响应的基础数据结构：
- `BaseInDto`：所有请求参数DTO的基类，支持任意字段
- `BaseOutDto`：所有响应数据DTO的基类
- `Result<T>`：标准响应格式，包含code、msg、data等字段
- `PageInfo`：分页信息数据结构

#### Path.ts - 接口路径定义
定义了接口路径的标准结构：
```typescript
interface Path {
    url: string;            // 接口具体路径
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'; // HTTP方法
    params?: {              // URL参数（可选）
        [key: string]: any;
    };
    prefix?: string;        // 路径前缀（可选）
}
```

#### API路径组织
接口路径按功能模块组织，例如登录相关接口：
- `LoginPaths.ts`：定义登录相关的所有接口路径
- `dto/`：存放对应模块的请求和响应数据结构

### 1.2 HTTP调用工具类（HttpClient.ts）

`HttpClient`是一个封装了Tauri后端HTTP命令调用的工具类，主要功能包括：

- **接口注册**：通过Vue插件方式注册到应用中
- **URL构建**：`fixUrl`方法负责智能拼接完整URL，包括：
  - 基础URL处理（确保协议、去除多余斜杠）
  - 路径拼接（baseUrl + api + prefix + url）
  - GET请求查询参数处理
- **请求封装**：通过Tauri的invoke调用后端HTTP命令
- **Token管理**：支持从UserInfo中获取token

### 1.3 使用示例

1. 定义API路径：
```typescript
// 在LoginPaths.ts中定义
static loginAPI: Path = {
  url: '/login',
  method: 'POST',
  prefix: ''
};
```

2. 定义数据传输对象：
```typescript
// 在dto/Login.ts中定义
class LoginInDto extends BaseInDto {
  username = '';
  password = '';
}
```

3. 发起请求：
```typescript
// 在组件中使用
const {http} = useCommon();
http.request<any>(LoginPaths.loginAPI, {
  username: 'admin',
  password: '123456'
});
```

## 2. CSS样式定义（src/assets/styles目录）

### 2.1 CSS变量定义（variable.scss）

定义了应用中使用的所有CSS变量，主要包括：

- **字体颜色**：
  - `$font-dark`：深色调文本 (#515A6E)
  - `$font-middle`：中色调文本 (#9499A5)
  - `$font-light`：浅色调文本 (#B0B7C7)

- **状态颜色**：
  - `$theme-color`：主题色 (#FC8719)
  - `$hover-color`：悬浮背景色 (#FFF8F2)
  - `$remind-red`：提醒红色 (#ED6A5E)
  - `$remind-green`：成功绿色 (#51C419)
  - `$remind-error`：错误红色 (#F5222D)

- **背景颜色**：
  - `$bg-shade-black`：黑色遮罩 (rgba(0, 0, 0, 0.15))
  - `$bg-gray`：灰色背景 (#F6F8FA)
  - `$border-default`：边框颜色 (#E1E6EC)

### 2.2 基础CSS类（constant.scss）

提供了一系列常用的布局辅助类，包括：

- **定位相关**：`.relative`
- **浮动相关**：`.fr`、`.fl`
- **显示模式**：`.block`、`.inline-block`
- **鼠标交互**：`.pointer`
- **内边距工具类**：`.pt-5`、`.pl-5`、`.pr-5`、`.pb-5`等

### 2.3 组件样式重写

对ViewUI Plus组件进行了样式重写，包括：
- `form.scss`：表单组件样式
- `poptip.scss`：气泡提示样式
- `modal.scss`：模态框样式

所有样式文件通过`index.scss`统一导入和管理。

## 3. 全局组件（src/components目录）

### 3.1 Ellipsis 文本省略组件

功能：自动检测文本是否超出容器宽度，超出时显示省略号并提供悬停提示。

**属性**：
- `content`：文本内容
- `placement`：气泡提示位置，默认为'bottom-start'

**使用方式**：
```vue
<Ellipsis :content="longText" placement="top" />
<!-- 或使用slot -->
<Ellipsis placement="bottom">
  <template #content>{{ longText }}</template>
</Ellipsis>
```

### 3.2 SvgIcon SVG图标组件

功能：统一管理和使用SVG图标。

**属性**：
- `name`：图标名称（必需）
- `prefix`：图标前缀，默认为'icon'
- `color`：图标颜色
- `size`：图标尺寸，默认为'10px'

**使用方式**：
```vue
<SvgIcon name="menu-resume" :size="20" color="#FC8719" />
```

## 4. 自定义指令（src/directive目录）

### 4.1 clearableSelect 可清空选择框指令

功能：为选择框组件添加清空按钮，增强交互体验。

**实现细节**：
- 自动为选择框添加清除按钮
- 鼠标悬停时显示，离开时隐藏
- 点击清除按钮时清空选择框内容

**使用方式**：
```vue
<Select v-clearableSelect v-model="value">
  <!-- 选项内容 -->
</Select>
```

### 4.2 clickoutside 点击外部指令

功能：监听点击元素外部的事件。

**实现细节**：
- 监听全局点击事件
- 判断点击目标是否在绑定元素内部
- 如不在内部，则触发回调函数

**使用方式**：
```vue
<div v-clickoutside="handleClickOutside">
  <!-- 内容 -->
</div>

<script setup>
const handleClickOutside = () => {
  // 处理点击外部的逻辑
}
</script>
```

### 4.3 trim 自动修剪指令

功能：自动修剪输入框内容两端的空白字符。

**实现细节**：
- 支持普通input和textarea
- 支持ViewUI的输入框组件
- 在失焦和回车键时触发修剪

**使用方式**：
```vue
<input v-trim v-model="value" />
<Input v-trim v-model="value" />
```

## 5. 页面布局（src/layout目录）

### 5.1 主布局（index.vue）

三栏布局，包含顶部导航栏、左侧菜单和主内容区：

- **响应式设计**：监听窗口大小，小于1500px时自动调整菜单宽度
- **组件结构**：
  - `<Top>`：顶部导航组件
  - `<LeftMenu>`：左侧菜单组件
  - `<router-view>`：路由视图，显示当前页面内容

### 5.2 简易布局（onlyHeader.vue）

仅有顶部导航栏的两栏布局，适用于登录页等不需要侧边栏的页面：

- **组件结构**：
  - `<Header>`：顶部导航组件
  - `<router-view>`：路由视图

### 5.3 布局组件

#### Header组件（header.vue）

实现了桌面应用的窗口控制功能：
- **窗口拖拽**：通过`data-tauri-drag-region`实现
- **窗口控制按钮**：最小化、最大化/还原、关闭
- **使用Tauri API**：通过`@tauri-apps/api/window`控制窗口行为

#### Sidebar组件（sidebar.vue）

实现了左侧导航菜单：
- **用户信息展示**：显示用户名和头像
- **动态菜单**：根据路由配置生成菜单项
- **菜单激活状态**：根据当前路由高亮对应的菜单项
- **响应式设计**：支持菜单宽度自动调整

## 6. 路由管理（src/router目录）

### 6.1 路由配置（routers.ts）

定义了应用的路由结构，使用了两种布局函数：

- **layout()**：带侧边栏的主布局，用于主要功能页面
- **onlyHeader()**：仅带头部的简易布局，用于登录页等

**路由定义示例**：
```typescript
// 登录页面（不显示在菜单中）
{...onlyHeader({
  path: '/login',
  title: '登录',
  component: () => import('@/views/login/index.vue')
})}

// 简历制作页面（显示在菜单中）
{...layout({
  path: '/resume',
  title: '简历制作',
  icon: 'menu-resume',
  component: () => import('@/views/resume/index.vue')
})}
```

### 6.2 路由实例（index.ts）

创建并配置了Vue Router实例：
- **路由模式**：使用`createWebHashHistory`（哈希模式）
- **路由守卫**：
  - `beforeEach`：路由前置守卫，可用于权限验证
  - `afterEach`：路由后置钩子，页面切换后滚动到顶部

## 7. 公共工具类（src/utiles目录）

### 7.1 useCommon.ts

提供了一个Vue组合式函数，方便组件中获取公共工具：
- 注入并返回HTTP客户端实例

**使用方式**：
```typescript
const {http} = useCommon();
http.request(...);
```

### 7.2 userInfo.ts

管理用户信息的单例类：
- 使用Vue的`reactive`保持响应性
- 存储token、用户名、用户ID等信息

**使用方式**：
```typescript
// 获取用户信息
const userName = UserInfo.info.userName;

// 更新用户信息
UserInfo.info.token = 'new-token';
```

### 7.3 tauriCommonds.ts

封装了与Tauri后端通信的命令：

- **auth对象**：
  - `saveToken`：保存token到后端存储
  - `getToken`：从后端存储获取token

- **keyboard对象**：
  - `listenSaveShortcut`：监听保存快捷键

## 8. 页面实现（src/views目录）

### 8.1 登录页面（login/index.vue）

应用的登录入口，目前是一个简单的占位页面，待完善具体的登录表单和逻辑。

### 8.2 简历页面（resume/index.vue）

简历制作的主页面，包含以下功能：
- **Token操作**：保存和获取token的测试功能
- **API调用**：展示了如何使用http客户端调用登录接口
- **使用示例**：
  ```typescript
  // 调用登录接口
  http.request<any>({
    url: '/login',
    method: 'POST',
    prefix: ''
  }, {
    username: 'admin',
    password: '123456'
  });
  ```

## 9. Tauri后端代码（src-tauri目录）

### 9.1 目录结构

Tauri后端采用Rust语言开发，主要包含以下部分：

- **src/commands/**：定义了各种Tauri命令，供前端调用
- **src/main.rs**：应用入口点
- **src/lib.rs**：库代码和命令注册
- **capabilities/default.json**：定义了应用的权限和能力
- **tauri.conf.json**：Tauri应用的配置文件

### 9.2 核心功能

Tauri后端主要提供以下功能：

- **HTTP请求代理**：通过Rust的HTTP客户端处理实际的HTTP请求
- **本地存储**：提供token等信息的持久化存储
- **系统集成**：窗口管理、快捷键监听等系统级功能
- **安全控制**：通过capabilities定义严格的权限控制

## 10. UI组件库（View UI Plus）

昆仑桌面应用采用View UI Plus作为UI组件库，这是一套基于Vue 3的企业级中后台组件库。

### 10.1 组件库介绍
- **官方文档**：[View UI Plus 官方文档](https://www.iviewui.com/view-ui-plus/guide/introduce)
- **组件数量**：提供超过80个常用底层组件（如Button、Input、DatePicker等）及业务组件
- **适用场景**：主要用于企业级中后台系统的界面开发

### 10.2 使用规范
- **导入方式**：根据项目需求按需导入组件
- **版本兼容性**：适用于Vue 3，兼容现代浏览器（不支持IE）
- **组件引用**：在组件中直接使用，如`<Button>`、`<Input>`等
- **类型支持**：完整支持TypeScript类型定义

## 11. 状态管理

昆仑桌面应用不使用Pinia或Vuex等状态管理库，采用以下方式进行状态管理：

### 11.1 全局状态管理
- **全局变量**：使用全局变量存储非持久化状态
- **示例**：`src/utils/userInfo.ts`中管理用户登录信息

### 11.2 组件间通信
- **使用Vue提供的**`provide/inject`**机制**：在组件树中进行状态传递
- **父子组件通信**：通过props和emit
- **兄弟组件通信**：通过共同父组件的状态中转

### 11.3 持久化存储
- **通过Tauri后端进行管理**：关键状态如登录token通过Tauri命令存储
- **实现位置**：`src-tauri/src/commands/auth.rs`中实现token的持久化存储

## 12. 表单处理规范

### 12.1 必填项校验
- **通用提示**：保存或提交时，如果必填信息未填写，应显示Toast提示：`请完善必填项！`
- **具体校验规则**：参考View UI Plus Form组件的校验规则

### 12.2 表单组件使用
- **优先使用View UI Plus表单组件**：如Form、FormItem、Input等
- **校验方法**：使用Form组件的validate方法进行表单校验

## 13. 响应式设计标准

### 13.1 百分比设置规则
- **块级元素**：宽度、内间距（padding）、外间距（margin）、图片等需要按照百分比设置
- **非百分比元素**：字号、SVG图标等不需要按照百分比显示

### 13.2 断点适配
- 根据窗口大小自动调整布局，如侧边栏宽度在小于1500px时自动调整

## 14. 前端页面开发规范

为确保代码的可维护性和一致性，昆仑桌面应用项目遵循以下前端开发规范：

### 10.1 样式规范

#### 10.1.1 变量和基础样式使用
- **优先使用已有变量**：开发过程中应优先使用`variable.scss`中定义的CSS变量
- **复用基础样式**：尽量使用`constant.scss`中已定义的基础样式类
- **避免重复定义**：不创建与已有样式功能重复的新样式

#### 10.1.2 样式文件组织
- **样式隔离**：页面的样式必须写在对应的Vue文件中，并使用`scoped`属性进行隔离
- **示例**：
```vue
<style scoped lang="scss">
.user-profile {
  color: $font-dark;
  background: $bg-gray;
}
</style>
```

#### 10.1.3 样式命名规范
- **命名要求**：使用直观且简单明了的名称
- **分隔符**：使用连字符`-`作为单词分隔符
- **禁止使用**：无意义的字母或数字排列
- **示例**：
  - ✅ `user-card`, `form-input-group`
  - ❌ `a1`, `box2`, `temp_style`

### 10.2 JavaScript/TypeScript规范

#### 10.2.1 语法和语言
- **使用setup语法糖**：所有Vue组件的JavaScript代码必须包裹在`<script setup lang="ts">`中
- **使用TypeScript**：严格遵守TypeScript的类型规范，为变量、函数参数和返回值指定类型

#### 10.2.2 命名规范

**文件命名**：
- **TS类文件**：使用大驼峰命名法（PascalCase）
  - 示例：`UserInfo.ts`, `HttpClient.ts`
- **其他文件**：使用驼峰命名法（camelCase）
  - 示例：`loginPage.vue`, `useCommon.ts`

**代码元素命名**：
- **类名**：使用大驼峰命名法
  - 示例：`BaseDto`, `LoginPaths`
- **方法名、变量名**：使用驼峰命名法
  - 示例：`fetchData()`, `userName`
- **命名要求**：表达具体用途，简洁明了，禁止使用无意义的字母和数字排列

### 10.3 注释规范

#### 10.3.1 文件注释
- **文件头部**：每个文件在头部必须包含注释，说明文件的用途和主要功能
- **示例**：
```typescript
/**
 * HTTP客户端工具类
 * 封装了与Tauri后端通信的HTTP请求方法
 */
```

#### 10.3.2 方法和变量注释
- **方法注释**：复杂方法必须包含详细注释，说明功能、参数和返回值
- **变量注释**：关键变量应有注释说明其用途
- **使用JSDoc规范**：注释应遵循JSDoc格式
- **示例**：
```typescript
/**
 * 修复URL路径，确保正确构建API地址
 * @param path 路径配置对象
 * @param data 请求参数
 * @returns 构建后的完整URL字符串
 */
private static fixUrl(path: Path, data?: any): string {
  // 实现逻辑
}
```

## 总结

昆仑桌面应用采用了现代化的前端架构，结合Vue 3、TypeScript和Tauri技术栈，实现了一个功能完整的桌面应用。项目使用View UI Plus作为UI组件库，通过全局变量和provide/inject机制进行状态管理，关键数据通过Tauri后端持久化存储。项目结构清晰，代码组织规范，遵循了Vue的最佳实践和上述开发规范，便于维护和扩展。

在实际开发中，应严格遵循文档中定义的规范，包括HTTP接口调用、CSS变量使用、组件开发、响应式设计等方面，确保代码质量和用户体验的一致性。