import { logger } from '@/utiles/logger';
import { mcpService, aiService } from '@/robot/service';


/**
 * 机器人管理器
 */
export class RobotManager {
  private static instance: RobotManager;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): RobotManager {
    if (!RobotManager.instance) {
      RobotManager.instance = new RobotManager();
    }
    return RobotManager.instance;
  }

  /**
   * 清理资源（关闭 MCP 和 AI）
   */
  public async cleanup(): Promise<void> {
    logger.info('[RobotManager] 清理资源...');

    try {
      // 停止 AI 任务
      await aiService.stopTask();
      logger.info('[RobotManager] AI 任务已停止');
    } catch (error) {
      logger.error('[RobotManager] 停止 AI 任务失败:', error);
    }

    try {
      // 停止 MCP
      await mcpService.stop();
      logger.info('[RobotManager] MCP 已停止');
    } catch (error) {
      logger.error('[RobotManager] 停止 MCP 失败:', error);
    }
  }

  /**
   * 睡眠
   */
  public sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}
