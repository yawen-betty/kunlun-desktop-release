import { invoke } from '@tauri-apps/api/core';

/**
 * AI 任务执行结果
 */
export interface TaskResult {
  /** 任务是否成功 */
  success: boolean;
  /** 任务执行结果消息 */
  message: string;
  /** 任务返回的数据 (可选) */
  data?: any;
  /** 工具调用次数 */
  tool_calls_count: number;
}

/**
 * AI Robot Service
 *
 * 用于管理 AI Agent 任务执行
 * 提供与 AI 模型交互、工具调用、任务编排等能力
 *
 * AI Agent 会自动：
 * 1. 理解用户任务意图
 * 2. 规划执行步骤
 * 3. 调用 MCP 工具完成浏览器自动化
 * 4. 返回执行结果
 *
 * @example
 * ```typescript
 * const aiService = AIRobotService.getInstance();
 *
 * // 执行 AI 任务
 * const result = await aiService.executeTask(
 *   'your-api-key',
 *   '帮我打开百度并搜索天气'
 * );
 *
 * console.log(result.message);
 * console.log(`调用了 ${result.tool_calls_count} 次工具`);
 * ```
 */
export class AIRobotService {
  private static instance: AIRobotService;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): AIRobotService {
    if (!AIRobotService.instance) {
      AIRobotService.instance = new AIRobotService();
    }
    return AIRobotService.instance;
  }

  /**
   * 执行 AI 任务（简化版）
   */
  async executeTask(apiKey: string, task: string): Promise<TaskResult> {
    // return await invoke('ai_execute_task', {
    //   apiKey: apiKey,
    //   task: task
    // });
    return await invoke('ai_execute_task_with_config', {
      apiKey: '1eb39bbb-226a-4e2b-8c8f-012148bf27a8',
      task,
      apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      model: 'ep-20251110093709-h4565',
      enableThinking: true
    });
  }

  /**
   * 执行 AI 任务（完整配置）
   *
   * @param {string} apiKey - AI 服务的 API 密钥
   * @param {string} task - 任务描述
   * @param {string} apiUrl - API 请求地址（可选） 默认https://open.bigmodel.cn/api/paas/v4/chat/completions
   * @param {string} model - 模型名称（可选）默认glm-4.5-flash
   * @param {boolean} enableThinking - 是否启用 thinking（可选） 默认禁用
   */
  async executeTaskWithConfig(
    apiKey: string,
    task: string,
    apiUrl?: string,
    model?: string,
    enableThinking?: boolean
  ): Promise<TaskResult> {
    return await invoke('ai_execute_task_with_config', {
      api_key: apiKey,
      task,
      api_url: apiUrl,
      model,
      enable_thinking: enableThinking
    });
  }

  /**
   * 强制停止当前正在执行的 AI 任务
   *
   * 设置取消标志，任务会在下一次检查点（对话循环的下一轮）停止执行
   *
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // 启动任务
   * const taskPromise = aiService.executeTask('sk-xxx', '执行复杂任务');
   *
   * // 如果任务执行时间过长，用户可以手动停止
   * await aiService.stopTask();
   *
   * // taskPromise 会抛出错误: "任务已被用户取消"
   * ```
   *
   * @remarks
   * - 不会立即中断任务，而是在下一轮对话开始时检查并退出
   * - 如果当前没有正在执行的任务，调用此方法无效
   * - 停止后的任务会抛出错误，需要在前端捕获处理
   */
  async stopTask(): Promise<void> {
    return await invoke('ai_stop_task');
  }
}
