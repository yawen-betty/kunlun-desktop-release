import { invoke } from '@tauri-apps/api/core';

/**
 * 浏览器安装状态
 */
export interface BrowserStatus {
  /** 浏览器是否已安装 */
  installed: boolean;
  /** 浏览器安装路径 (可选) */
  path?: string;
}

/**
 * MCP Robot Service
 * 
 * 用于管理 Model Context Protocol (MCP) Server
 * 提供浏览器自动化服务的启动、停止、工具调用等能力
 * 
 * MCP Server 基于 Playwright，提供：
 * - 浏览器控制（导航、点击、输入等）
 * - 页面截图和快照
 * - 元素定位和操作
 * - 表单填写和提交
 * 
 * @example
 * ```typescript
 * const mcpService = MCPRobotService.getInstance();
 * 
 * // 启动 MCP Server
 * await mcpService.start(true);
 * 
 * // 调用工具
 * const result = await mcpService.callTool('browser_navigate', {
 *   url: 'https://www.baidu.com'
 * });
 * 
 * // 停止 MCP Server
 * await mcpService.stop();
 * ```
 */
export class MCPRobotService {
  private static instance: MCPRobotService;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): MCPRobotService {
    if (!MCPRobotService.instance) {
      MCPRobotService.instance = new MCPRobotService();
    }
    return MCPRobotService.instance;
  }

  /**
   * 启动 MCP Server
   * 
   * 启动流程：
   * 1. 检查浏览器是否已安装
   * 2. 如果未安装，自动下载并安装 Chromium
   * 3. 启动 MCP Server 进程
   * 4. 初始化 MCP 协议连接
   * 5. 打开浏览器窗口（如果是 headed 模式）
   * 
   * @param {boolean} headed - 是否显示浏览器窗口
   *   - true: 显示浏览器窗口（用于调试和演示）
   *   - false: 无头模式运行（后台执行，不显示窗口）
   * @returns {Promise<string>} 返回启动成功的消息
   * @throws {string} 如果启动失败或浏览器安装失败
   * 
   * @example
   * ```typescript
   * // 显示浏览器窗口
   * await mcpService.start(true);
   * 
   * // 无头模式运行
   * await mcpService.start(false);
   * ```
   * 
   * @remarks
   * - 首次启动会自动下载 Chromium（约 150MB）
   * - 同一时间只能运行一个 MCP Server 实例
   * - 启动后会自动打开 about:blank 页面
   */
  async start(headed: boolean): Promise<string> {
    return await invoke('start_mcp_server', { headless: !headed });
  }

  /**
   * 停止 MCP Server
   * 
   * 停止流程：
   * 1. 关闭浏览器窗口
   * 2. 断开 MCP 协议连接
   * 3. 终止 MCP Server 进程
   * 4. 清理相关资源
   * 
   * @returns {Promise<void>}
   * @throws {string} 如果停止失败
   * 
   * @example
   * ```typescript
   * await mcpService.stop();
   * ```
   * 
   * @remarks
   * - 停止后需要重新调用 start() 才能继续使用
   * - 会自动清理所有打开的浏览器标签页
   */
  async stop(): Promise<void> {
    return await invoke('stop_mcp_server');
  }

  /**
   * 检查浏览器安装状态
   * 
   * @returns {Promise<BrowserStatus>} 返回浏览器安装状态
   * 
   * @example
   * ```typescript
   * const status = await mcpService.checkBrowser();
   * if (status.installed) {
   *   console.log('浏览器已安装:', status.path);
   * } else {
   *   console.log('浏览器未安装，需要先安装');
   * }
   * ```
   */
  async checkBrowser(): Promise<BrowserStatus> {
    return await invoke('check_mcp_browser');
  }

  /**
   * 安装浏览器
   * 
   * 手动触发浏览器安装，通常不需要调用此方法
   * 因为 start() 会自动安装浏览器
   * 
   * @returns {Promise<void>}
   * @throws {string} 如果安装失败
   * 
   * @example
   * ```typescript
   * await mcpService.installBrowser();
   * ```
   * 
   * @remarks
   * - 下载大小约 150MB
   * - 需要网络连接
   * - 安装时间取决于网络速度
   */
  async installBrowser(): Promise<void> {
    return await invoke('install_mcp_browser');
  }

  /**
   * 调用 MCP 工具
   * 
   * 执行浏览器自动化操作，如导航、点击、输入等
   * 
   * 常用工具：
   * - browser_navigate: 导航到指定 URL
   * - browser_click: 点击页面元素
   * - browser_fill: 填写表单字段
   * - browser_screenshot: 截取页面截图
   * - browser_snapshot: 获取页面快照
   * 
   * @param {string} toolName - 工具名称
   * @param {any} args - 工具参数，根据不同工具有不同的参数结构
   * @returns {Promise<any>} 返回工具执行结果
   * @throws {string} 如果工具调用失败或 MCP Server 未启动
   * 
   * @example
   * ```typescript
   * // 导航到网页
   * await mcpService.callTool('browser_navigate', {
   *   url: 'https://www.baidu.com'
   * });
   * 
   * // 点击元素
   * await mcpService.callTool('browser_click', {
   *   selector: '#su'
   * });
   * 
   * // 填写输入框
   * await mcpService.callTool('browser_fill', {
   *   selector: '#kw',
   *   value: 'TypeScript'
   * });
   * 
   * // 截图
   * const screenshot = await mcpService.callTool('browser_screenshot', {});
   * 
   * // 获取页面快照
   * const snapshot = await mcpService.callTool('browser_snapshot', {});
   * ```
   * 
   * @remarks
   * - 需要先调用 start() 启动 MCP Server
   * - 工具参数格式参考 MCP 协议文档
   * - 某些操作可能需要等待页面加载完成
   */
  async callTool(toolName: string, args: any): Promise<any> {
    return await invoke('mcp_call_tool', { 
      toolName, 
      args 
    });
  }
}
