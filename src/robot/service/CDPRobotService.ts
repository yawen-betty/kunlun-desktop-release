import { invoke } from '@tauri-apps/api/core';

/**
 * Cookie 数据结构
 */
export interface Cookie {
  /** Cookie 名称 */
  name: string;
  /** Cookie 值 */
  value: string;
  /** Cookie 所属域名 */
  domain: string;
  /** Cookie 路径 */
  path: string;
}

/**
 * 网络事件数据结构
 */
export interface NetworkEvent {
  length: number;
  /** 请求 ID */
  request_id: string;
  /** 请求 URL */
  url: string;
  /** 请求方法 (GET, POST, etc.) */
  method: string;
  /** HTTP 状态码 (可选) */
  status?: number;
  /** 响应体内容 (可选) */
  response_body?: string;
}

/**
 * CDP Robot Service
 *
 * 用于管理 Chrome DevTools Protocol (CDP) 相关功能
 * 提供浏览器控制、脚本执行、Cookie 管理、网络监听等能力
 *
 * @example
 * ```typescript
 * const cdpService = CDPRobotService.getInstance();
 *
 * // 初始化 CDP
 * await cdpService.init();
 *
 * // 执行脚本
 * const title = await cdpService.executeScript('document.title');
 *
 * // 获取网络事件
 * const events = await cdpService.getNetworkEvents();
 * ```
 */
export class CDPRobotService {
  private static instance: CDPRobotService;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): CDPRobotService {
    if (!CDPRobotService.instance) {
      CDPRobotService.instance = new CDPRobotService();
    }
    return CDPRobotService.instance;
  }

  /**
   * 初始化 CDP 连接并启用网络监听
   *
   * 此方法会：
   * 1. 连接到 MCP 浏览器的 CDP 端口
   * 2. 启用 Target 发现
   * 3. 附加到所有已存在的页面 Target
   * 4. 为每个 Target 启用网络监听
   *
   * @returns {Promise<string>} 返回初始化成功的消息
   * @throws {string} 如果 MCP Server 未启动或连接失败
   *
   * @example
   * ```typescript
   * try {
   *   const result = await cdpService.init();
   *   console.log(result); // "CDP initialized successfully"
   * } catch (error) {
   *   console.error('CDP 初始化失败:', error);
   * }
   * ```
   */
  async init(): Promise<string> {
    return await invoke('cdp_init');
  }

  /**
   * 在浏览器中执行 JavaScript 代码
   *
   * @param {string} script - 要执行的 JavaScript 代码字符串
   * @returns {Promise<any>} 返回脚本执行结果
   * @throws {string} 如果脚本执行失败或 CDP 未初始化
   *
   * @example
   * ```typescript
   * // 获取页面标题
   * const title = await cdpService.executeScript('document.title');
   *
   * // 获取页面 URL
   * const url = await cdpService.executeScript('window.location.href');
   *
   * // 执行复杂操作
   * const result = await cdpService.executeScript(`
   *   const elements = document.querySelectorAll('a');
   *   return Array.from(elements).map(a => a.href);
   * `);
   * ```
   */
  async executeScript(script: string): Promise<any> {
    return await invoke('cdp_execute_script', { script });
  }

  /**
   * 获取浏览器当前的所有 Cookies
   *
   * @returns {Promise<Cookie[]>} 返回 Cookie 数组
   * @throws {string} 如果获取失败或 CDP 未初始化
   *
   * @example
   * ```typescript
   * const cookies = await cdpService.getCookies();
   * cookies.forEach(cookie => {
   *   console.log(`${cookie.name}=${cookie.value}`);
   * });
   * ```
   */
  async getCookies(): Promise<Cookie[]> {
    return await invoke('cdp_get_cookies');
  }

  /**
   * 启用网络监听
   *
   * 启用后会监听所有页面的网络请求和响应
   * 通常在 init() 方法中已自动调用，无需手动调用
   *
   * @returns {Promise<void>}
   * @throws {string} 如果启用失败或 CDP 未初始化
   *
   * @example
   * ```typescript
   * await cdpService.enableNetwork();
   * ```
   */
  async enableNetwork(): Promise<void> {
    return await invoke('cdp_enable_network');
  }

  /**
   * 获取已捕获的网络事件
   *
   * 返回自启用网络监听以来捕获的所有网络请求和响应事件
   *
   * @returns {Promise<NetworkEvent[]>} 返回网络事件数组
   * @throws {string} 如果获取失败或 CDP 未初始化
   *
   * @example
   * ```typescript
   * const events = await cdpService.getNetworkEvents();
   * console.log(`捕获了 ${events.length} 个网络请求`);
   *
   * events.forEach(event => {
   *   console.log(`${event.method} ${event.url} - ${event.status}`);
   * });
   * ```
   */
  async getNetworkEvents(): Promise<NetworkEvent[]> {
    return await invoke('cdp_get_network_events');
  }

  /**
   * 清除已捕获的网络事件记录
   *
   * 清空内存中存储的所有网络事件，不影响网络监听功能
   *
   * @returns {Promise<void>}
   * @throws {string} 如果清除失败或 CDP 未初始化
   *
   * @example
   * ```typescript
   * // 清除旧的网络事件
   * await cdpService.clearNetworkEvents();
   *
   * // 执行新的操作
   * // ...
   *
   * // 获取新的网络事件
   * const newEvents = await cdpService.getNetworkEvents();
   * ```
   */
  async clearNetworkEvents(): Promise<void> {
    return await invoke('cdp_clear_network_events');
  }

  /**
   * 获取指定请求的响应体
   *
   * @param {string} requestId - 请求 ID（从 NetworkEvent 中获取）
   * @returns {Promise<string>} 返回响应体内容
   * @throws {string} 如果获取失败或 CDP 未初始化
   *
   * @example
   * ```typescript
   * const events = await cdpService.getNetworkEvents();
   * const userApiEvent = events.find(e => e.url.includes('/user'));
   * if (userApiEvent) {
   *   const body = await cdpService.getResponseBody(userApiEvent.request_id);
   *   const data = JSON.parse(body);
   *   console.log(data);
   * }
   * ```
   */
  async getResponseBody(requestId: string): Promise<string> {
    return await invoke('cdp_get_response_body', { requestId });
  }

  /**
   * 发送原始 CDP 命令
   *
   * 通用方法，可以调用任何 CDP 协议命令
   *
   * @param {string} method - CDP 方法名（如 "Network.setCookie"）
   * @param {any} params - 命令参数
   * @returns {Promise<any>} 返回命令执行结果
   * @throws {string} 如果命令执行失败或 CDP 未初始化
   *
   * @example
   * ```typescript
   * // 设置 Cookie
   * await cdpService.sendCommand('Network.setCookie', {
   *   name: 'token',
   *   value: 'abc123',
   *   domain: '.zhipin.com',
   *   path: '/'
   * });
   *
   * // 截图
   * const result = await cdpService.sendCommand('Page.captureScreenshot', {});
   * ```
   */
  async sendCommand(method: string, params: any): Promise<any> {
    return await invoke('cdp_send_command', { method, params });
  }
}
