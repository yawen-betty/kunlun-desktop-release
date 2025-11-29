import {logger} from "@/utiles/logger.ts";
import {cdpService, mcpService, robotManager} from "@/robot/service";
import {channelAuth} from "@/robot/channelLogin/authManage.ts";
import {CHANNEL_CONFIG} from "@/robot/config.ts";

export async function checkLogin(): Promise<Array<string>> {
  await robotManager.cleanup();
  await robotManager.sleep(2000);
  // 1. 启动 MCP + CDP
  logger.info('[PositionSearch] 启动 MCP Server...');
  await mcpService.start(true);

  logger.info('[PositionSearch] 初始化 CDP...');
  await cdpService.init();

  let channels = [];

  // 2. 获取并设置 Cookies
  logger.info('[PositionSearch] 获取 Cookies...');
  const cookies = await channelAuth.getAllCookies();
  const channelList = ['boss', 'zhilian', 'guopin']

  for (const channel of channelList) {
    const isLogin = await check(channel, cookies[channel]);
    if (isLogin) {
      channels.push(channel);
    }
  }
  await robotManager.cleanup();
  return channels
}

export async function check (channelName:string, cookiesStr:string): Promise<boolean> {
  const config = CHANNEL_CONFIG[channelName.toLowerCase() as keyof typeof CHANNEL_CONFIG];
  if (cookiesStr === 'no cookies' || !cookiesStr) {
    return false;
  }

  const cookies = JSON.parse(cookiesStr);
  logger.info('[PositionSearch] 设置 Cookies...');

  for (const cookie of cookies) {
    await cdpService.sendCommand('Network.setCookie',  {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path
    });
  }

  // 3. 刷新页面验证登录
  logger.info('[PositionSearch] 验证登录状态...');
  await cdpService.clearNetworkEvents(); // 先清空
  await mcpService.callTool('browser_navigate', { url: config.homeUrl });
  await robotManager.sleep(3000); // 等待数据加载
  const networkEvents = await cdpService.getNetworkEvents();
  const loginEvents = networkEvents.filter(e => e.url.includes(config.loginCheckApi));

  let isLoggedIn = false;
  if (loginEvents.length > 0) {
    const loginEvent = loginEvents.pop(); // 获取最后一个

    if (loginEvent?.response_body) {
      try {
        const data = JSON.parse(loginEvent.response_body);
        isLoggedIn = data.code === config.loginSuccessCode;
      } catch (error) {
        logger.error('[PositionSearch] 解析登录响应失败:', error);
        await channelAuth.saveCookies(channelName, '');
        isLoggedIn = false;
      }
    }
  }

  return isLoggedIn;
}
