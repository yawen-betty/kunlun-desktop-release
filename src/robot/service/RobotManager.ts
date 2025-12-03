import {logger} from '@/utiles/logger';
import {mcpService, aiService, cdpService} from '@/robot/service';
import {channelAuth} from "@/robot/channelLogin/authManage.ts";
import {executePositionSearch} from "@/robot/channelPositions/positionSearch.ts";
import {listen} from '@tauri-apps/api/event';


/**
 * 机器人管理器
 */
export class RobotManager {
    private static instance: RobotManager;
    private isRunning: boolean = false; // 运行状态标志
    private browserClosedUnlisten: (() => void) | null = null; // 浏览器关闭事件监听器
    private mcpInitialized: boolean = false; // MCP 初始化状态
    private isCleaningUp: boolean = false; // 清理中标志
    private isStopping: boolean = false; // 停止中标志

    private constructor() {
        // 初始化时设置浏览器关闭监听
        this.setupBrowserClosedListener();
    }

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
     * 初始化 MCP（幂等操作）
     */
    public async initMCP() {
        if (this.mcpInitialized) {
            logger.info('[RobotManager] MCP 已初始化，跳过');
            return;
        }

        logger.info('[RobotManager] 初始化 MCP...');
        await mcpService.start(true);
        await cdpService.init();
        this.mcpInitialized = true;
        logger.info('[RobotManager] MCP 初始化完成');
    }

    /**
     * 清理资源（关闭 MCP 和 AI）
     */
    public async cleanup(): Promise<void> {
        if (this.isCleaningUp) {
            logger.info('[RobotManager] 正在清理中，跳过重复调用');
            return;
        }

        this.isCleaningUp = true;
        this.isStopping = true; // 设置停止标志，防止浏览器关闭事件触发
        logger.info('[RobotManager] 清理资源...');

        // 设置停止标志
        this.isRunning = false;

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
            this.mcpInitialized = false;
            logger.info('[RobotManager] MCP 已停止');
        } catch (error) {
            logger.error('[RobotManager] 停止 MCP 失败:', error);
        }

        // 保持浏览器关闭监听器活跃（不取消），以便处理后续的浏览器关闭事件
        logger.info('[RobotManager] 保持浏览器关闭监听器活跃');

        this.isCleaningUp = false;
        this.isStopping = false; // 清理完成，重置停止标志
    }

    /**
     * 睡眠
     */
    public sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 爬简历机器人调度
     */
    public async crawlPosition(searchParams: any, taskId: string) {
        this.isRunning = true;
        const channelList = ['boss', 'zhilian', 'guopin']

        logger.info('[RobotManager] 开始爬取职位...');

        try {
            // 在循环开始前初始化 MCP（幂等操作）
            await this.initMCP();
        } catch (error) {
            logger.error('[RobotManager] MCP 初始化失败:', error);
            this.isRunning = false;
            return;
        }

        // 外层循环：持续执行直到被停止
        while (this.isRunning) {
            logger.info('[RobotManager] 新一轮爬取开始');

            // 获取所有渠道的 Cookie
            const cookies = await channelAuth.getAllCookies();

            // 内层循环：遍历所有渠道
            for (const channel of channelList) {
                // 检查是否被停止
                if (!this.isRunning) {
                    logger.info('[RobotManager] 爬取已停止');
                    return;
                }

                const cookiesStr = cookies[channel];

                // 检查 Cookie 是否有效
                if (cookiesStr && cookiesStr !== 'no cookies') {
                    logger.info(`[RobotManager] 开始爬取 ${channel} 渠道`);

          try {
            await executePositionSearch({
              channelName: channel,
              searchParams: searchParams,
              apiKey: '2f8832011b8142c88355c47e436a371d.dxOs4FN5VORHJGbI'
            },
            taskId);

                        logger.info(`[RobotManager] ${channel} 渠道爬取完成`);
                    } catch (error) {
                        logger.error(`[RobotManager] ${channel} 渠道爬取失败:`, error);
                    }

                    // 渠道间延迟
                    await this.sleep(2000);
                } else {
                    logger.info(`[RobotManager] ${channel} 渠道无有效 Cookie，跳过`);
                }
            }

            logger.info('[RobotManager] 本轮爬取完成，等待下一轮...');

            // 检查是否被停止
            if (!this.isRunning) {
                logger.info('[RobotManager] 爬取已停止');
                return;
            }

            // 轮次间延迟（可配置）
            await this.sleep(1000 * 60 * 3);

            // 检查 MCP 是否需要重新初始化（浏览器被关闭）
            if (!this.mcpInitialized && this.isRunning) {
                logger.info('[RobotManager] 检测到浏览器已关闭，重新初始化 MCP...');
                try {
                    await this.initMCP();
                } catch (error) {
                    logger.error('[RobotManager] 重新初始化 MCP 失败:', error);
                    this.isRunning = false;
                    return;
                }
            }
        }
        logger.info('[RobotManager] 爬取循环结束');
    }

    /**
     * 设置浏览器关闭监听
     */
    private async setupBrowserClosedListener() {
        try {
            this.browserClosedUnlisten = await listen('browser-closed', (event) => {
                logger.warning('[RobotManager] 浏览器已被手动关闭', event.payload);

                // 如果正在执行 cleanup，忽略此事件（避免循环）
                if (this.isStopping) {
                    logger.info('[RobotManager] 正在停止中，忽略浏览器关闭事件');
                    return;
                }

                // 标记 MCP 未初始化（需要重新初始化）
                this.mcpInitialized = false;

                // 仅停止任务，不清理资源（允许重新启动）
                this.isRunning = false;
            });
            logger.info('[RobotManager] 浏览器关闭监听器已设置');
        } catch (error) {
            logger.error('[RobotManager] 设置浏览器关闭监听器失败:', error);
        }
    }
}
