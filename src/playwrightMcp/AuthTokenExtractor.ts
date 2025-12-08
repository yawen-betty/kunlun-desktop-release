import { invoke } from '@tauri-apps/api/core';

/**
 * 认证 Token 提取器
 * 
 * 任务1: 使用 MCP 打开网站,等待用户登录,提取登录 Token
 */
export class AuthTokenExtractor {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * 执行任务: 使用 MCP 打开网站
   */
  async execute(): Promise<AuthTokenResult> {
    try {
      console.log(`使用 MCP 打开网站: ${this.url}`);
      
      // 调用 MCP browser_navigate 工具
      const result = await invoke('mcp_call_tool', {
        toolName: 'browser_navigate',
        args: { url: this.url }
      });

      return {
        success: true,
        url: this.url,
        message: 'MCP 浏览器已打开网站',
        mcpResult: result,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        url: this.url,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      };
    }
  }
}

/**
 * 认证 Token 结果
 */
export interface AuthTokenResult {
  success: boolean;
  url: string;
  message?: string;
  mcpResult?: any;
  token?: string;
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>;
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
  error?: string;
  timestamp: number;
}
