import {logger} from '@/utiles/logger';
import {mcpService, aiService, cdpService} from '@/robot/service';
import {channelAuth} from "@/robot/channelLogin/authManage.ts";
import {executePositionSearch} from "@/robot/channelPositions/positionSearch.ts";
import {listen} from '@tauri-apps/api/event';
import {UserInfo} from "@/utiles/userInfo.ts";
import emitter from "@/utiles/eventBus.ts";


/**
 * 机器人管理器
 */
export class RobotManager {
    private static instance: RobotManager;
    public isRealStop: boolean = true;
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

        // await Promise.all([
        //     aiService.stopTask().catch(err => logger.error('停止AI失败:', err)),
        //     mcpService.stop().catch(err => logger.error('停止MCP失败:', err))
        // ]);
        // this.mcpInitialized = false;

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
    public async crawlPosition(searchParams: any, taskId: string, resumeText: string, prompt: string) {
        this.isRunning = true;
        this.isRealStop = false
        const channelList = ['boss', 'zhilian', 'guopin']

        logger.info('[RobotManager] 开始爬取职位...');

        try {
            // 在循环开始前初始化 MCP（幂等操作）
            await this.initMCP();
        } catch (error) {
            logger.error('[RobotManager] MCP 初始化失败:', error);
            this.isRunning = false;
            this.isRealStop = true;
            return;
        }

        // 外层循环：持续执行直到被停止（最多10轮）
        let roundCount = 0;
        const maxRounds = 20;
        while (this.isRunning && roundCount < maxRounds) {
            roundCount++;
            logger.info(`[RobotManager] 第 ${roundCount}/${maxRounds} 轮爬取开始`);

            // 获取所有渠道的 Cookie
            const cookies = await channelAuth.getAllCookies();
            if (channelList.every(channel => !cookies[channel])) {
                logger.info('[RobotManager] 没有任何渠道登录信息 爬取已停止');
                this.isRealStop = true
                return;
            }
            // 内层循环：遍历所有渠道
            for (const channel of channelList) {
                // 检查是否被停止
                if (!this.isRunning) {
                    logger.info('[RobotManager] 爬取已停止');
                    await this.cleanup()
                    this.isRealStop = true
                    return;
                }

                const cookiesStr = cookies[channel];

                // 检查 Cookie 是否有效
                if (cookiesStr && cookiesStr !== 'no cookies') {
                    logger.info(`[RobotManager] 开始爬取 ${channel} 渠道`);

                    try {
                        const res = await executePositionSearch({
                                channelName: channel,
                                searchParams: searchParams,
                                apiKey: UserInfo.info.modelList[0].apiKey!,
                                // apiKey: 'ca9112c0753043ae9c2f9647892f49e7.bfZ2cqxbzv7duOph'
                            },
                            resumeText,
                            taskId,
                            prompt,
                            () => this.isRunning
                        );

                        if (res.code === 403) {
                            emitter.emit('loginFailure', channel)
                        }
                        logger.info(`[RobotManager] ${channel} 渠道爬取完成`);
                    } catch (error: any) {
                        if (error.name === 'AbortError') {
                            logger.info(`[RobotManager] ${channel} 渠道已被取消`);
                            return; // 直接退出，不继续处理其他渠道
                        }
                        logger.error(`[RobotManager] ${channel} 渠道爬取失败:`, error);
                    }

                    // 渠道间延迟
                    await this.sleep(2000);
                } else {
                    logger.info(`[RobotManager] ${channel} 渠道无有效 Cookie，跳过`);
                }
            }

            logger.info(`[RobotManager] 第 ${roundCount}/${maxRounds} 轮爬取完成，等待下一轮...`);

            // 检查是否被停止
            if (!this.isRunning) {
                logger.info('[RobotManager] 爬取已停止');
                await this.cleanup()
                this.isRealStop = true
                return;
            }

            // 轮次间延迟（可配置）
            await this.sleep(1000 * 30);

            // 检查 MCP 是否需要重新初始化（浏览器被关闭）
            if (!this.mcpInitialized && this.isRunning) {
                logger.info('[RobotManager] 检测到浏览器已关闭，重新初始化 MCP...');
                try {
                    await this.initMCP();
                } catch (error) {
                    logger.error('[RobotManager] 重新初始化 MCP 失败:', error);
                    this.isRunning = false;
                    this.isRealStop = true;
                    return;
                }
            }
        }
        if (roundCount >= maxRounds) {
            await this.cleanup();
            this.isRealStop = true;
            logger.info(`[RobotManager] 已完成最大轮次 ${maxRounds}，爬取结束`);
            emitter.emit('closeTask', false)
        } else {
            this.isRealStop = true;
            logger.info('[RobotManager] 爬取循环结束');
        }
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

                this.cleanup();
                // 通知前端 取消loading
                emitter.emit('cancelLoading');

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
