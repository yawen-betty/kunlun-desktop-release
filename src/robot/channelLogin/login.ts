import {mcpService, cdpService, robotManager} from '@/robot/service';
import {channelAuth} from '@/robot/channelLogin/authManage.ts';
import {logger} from '@/utiles/logger';

/**
 * 登录结果
 */
export interface LoginResult {
    /** 是否成功 */
    success: boolean;
    /** 渠道名称 */
    channelName: string;
    /** 错误消息（失败时） */
    error?: string;
}

// 内部状态
let isRunning = false;
const CHECK_INTERVAL = 2000; // 检查间隔（毫秒）
const TIMEOUT_MS = 300 * 1000; // 5 分钟超时

/**
 * 执行渠道登录流程
 *
 * 使用 MCP + CDP 实现自动化登录：
 * 1. 启动 MCP Server（有头模式）
 * 2. 初始化 CDP 连接
 * 3. 打开登录页面
 * 4. 等待用户手动登录
 * 5. 检测登录成功
 * 6. 提取并保存 Cookies
 * 7. 清理资源
 *
 * @returns 登录结果
 *
 * @example
 * ```typescript
 * import { executeLogin } from '@/robot/channelLogin/Login';
 *
 * const result = await executeLogin({
 *   url: 'https://www.zhipin.com/web/user/',
 *   channelName: 'boss'
 * });
 *
 * if (result.success) {
 *   console.log('登录成功！Cookies 已保存');
 * }
 * ```
 * @param channelName
 */
export async function executeLogin(channelName: string): Promise<LoginResult> {
    isRunning = true;
    const config = CHANNEL_CONFIG[channelName.toLowerCase() as keyof typeof CHANNEL_CONFIG];

    try {
        // 1. 启动 MCP Server（有头模式）
        logger.info('[ChannelLogin] 启动 MCP Server...');
        await mcpService.start(true);

        // 2. 初始化 CDP 连接
        logger.info('[ChannelLogin] 初始化 CDP...');
        await cdpService.init();

        // 3. 清空之前的网络事件
        logger.info('[ChannelLogin] 清空网络事件...');
        await cdpService.clearNetworkEvents();

        // 4. 打开登录页面
        logger.info('[ChannelLogin] 打开登录页面:', config.loginUrl);
        await mcpService.callTool('browser_navigate', {url: config.loginUrl});
        logger.info('[ChannelLogin] 页面导航完成');

        // 等待页面加载
        await robotManager.sleep(2000);

        // 5. 等待用户登录
        logger.info('[ChannelLogin] 等待用户登录...');
        await waitForLogin(channelName);

        // 6. 提取 Cookies
        logger.info('[ChannelLogin] 提取 Cookies...');
        const cookies = await extractCookies();

        // 7. 保存到渠道认证
        logger.success('[ChannelLogin] 保存认证信息...');
        await channelAuth.saveCookies(channelName, cookies);

        // 8. 登录成功，停止 MCP Server
        logger.success('[ChannelLogin] 登录成功，关闭浏览器...');
        await cdpService.clearNetworkEvents();
        await mcpService.stop();

        return {
            success: true,
            channelName
        };

    } catch (error) {
        logger.error('[ChannelLogin] 执行失败:', error);
        // 发生错误时才停止 MCP Server
        try {
            await cdpService.clearNetworkEvents();
            await mcpService.stop();
        } catch (e) {
            logger.error('[ChannelLogin] 停止 MCP Server 失败:', e);
        }
        return {
            success: false,
            channelName,
            error: String(error)
        };
    } finally {
        isRunning = false;
    }
}

/**
 * 等待用户登录
 */
async function waitForLogin(channelName: string): Promise<void> {
    const startTime = Date.now();

    while (isRunning && Date.now() - startTime < TIMEOUT_MS) {
        // 根据渠道使用不同的检测策略
        const isLoggedIn = await checkLoginByChannel(channelName);

        if (isLoggedIn) {
            logger.success('[ChannelLogin] 检测到登录成功');
            return;
        }

        await robotManager.sleep(CHECK_INTERVAL);
    }

    throw new Error('登录超时');
}

// 渠道登录检测配置
const CHANNEL_CONFIG = {
    boss: {
        url: 'https://www.zhipin.com/',
        loginUrl: 'https://www.zhipin.com/web/user/?ka=header-login',
        apiUrl: '/wapi/zpuser/wap/getUserInfo.json',
        successCode: 0
    },
    zhilian: {
        url: 'https://www.zhaopin.com/',
        loginUrl: 'https://passport.zhaopin.com/login',
        apiUrl: '/user/detail',
        successCode: 200
    },
    guopin: {
        url: 'https://www.iguopin.com/',
        loginUrl: 'https://www.iguopin.com/login',
        apiUrl: '/personal/user/account/v1/userinfo',
        successCode: 200
    }
};

/**
 * 根据渠道检查登录状态
 */
async function checkLoginByChannel(channelName: string): Promise<boolean> {
    const config = CHANNEL_CONFIG[channelName.toLowerCase() as keyof typeof CHANNEL_CONFIG];
    if (!config) return false;

    const networkEvents = await cdpService.getNetworkEvents();
    const userApiEvents = networkEvents.filter(e => e.url.includes(config.apiUrl));

    if (userApiEvents.length > 0) {
        const userApiEvent = userApiEvents.pop();

        if (userApiEvent?.response_body) {
            try {
                const data = JSON.parse(userApiEvent.response_body);
                return data.code === config.successCode;
            } catch (error) {
                logger.error(`[${channelName}登录] 解析响应失败:`, error);
            }
        }
    }

    return false;
}

/**
 * 提取 Cookies
 */
async function extractCookies(): Promise<string> {
    const cookies = await cdpService.getCookies();
    logger.info('cookies:', cookies);
    return JSON.stringify(cookies);
}
