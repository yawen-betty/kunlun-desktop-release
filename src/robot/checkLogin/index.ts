import {logger} from "@/utiles/logger.ts";
import {cdpService, mcpService, robotManager} from "@/robot/service";
import {channelAuth} from "@/robot/channelLogin/authManage.ts";
import {CHANNEL_CONFIG} from "@/robot/config.ts";
import {invoke} from "@tauri-apps/api/core";

// urls
interface URLS {
  url: string;
  method: string;
  referer: string;
  code: 200 | 0;
}

// 定义响应接口
interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}
export async function checkLogin(): Promise<Array<string>> {
  // await robotManager.cleanup();
  // await robotManager.sleep(2000);
  // // 1. 启动 MCP + CDP
  // logger.info('[PositionSearch] 启动 MCP Server...');
  // await mcpService.start(true);
  //
  // logger.info('[PositionSearch] 初始化 CDP...');
  // await cdpService.init();
  //
  let channels = [];

  // 2. 获取并设置 Cookies
  logger.info('[PositionSearch] 获取 Cookies...');
  const cookies = await channelAuth.getAllCookies();
  const channelList = ['boss', 'zhilian', 'guopin']

  for (const channel of channelList) {
    const isLogin = await check(channel, cookies[channel]);
    if (isLogin) {
      channels.push(channel);
    } else {
      await channelAuth.saveCookies(channel, '');
    }
  }
  // await robotManager.cleanup();
  return channels
}

export async function check (channelName:string, cookiesStr:string): Promise<boolean> {
  if (cookiesStr === 'no cookies' || !cookiesStr) {
    return false;
  }

  let urls: URLS = {
    url: 'https://www.zhipin.com/wapi/zpgeek/agreement/update/tip.json',
    referer: 'https://www.zhipin.com/dalian/?seoRefer=index',
    code: 0,
    method: 'GET'
  };

  if (channelName === 'zhilian') {
    urls = {
      url: 'https://fe-api.zhaopin.com/c/i/user/detail',
      referer: 'https://www.zhaopin.com',
      code: 200,
      method: 'GET'
    }
  } else if (channelName === 'guopin') {
    urls = {
      url: 'https://gp-api.iguopin.com/personal/user/account/v1/userinfo',
      referer: 'https://www.iguopin.com/',
      code: 200,
      method: 'POST'
    }
  }

  try {
    const cookies = JSON.parse(cookiesStr);
    const cookieHeader = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
    let header = {
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': urls.referer
    }
    if (channelName === 'guopin') {
      const apiauthCookie = cookies.find((c: any) => c.name === '__token__');
      const apiauth = apiauthCookie?.value;
      header = Object.assign(header,{
        'apiauth': apiauth
      })
    }

    // 直接调用 http_request 命令
    const response: HttpResponse = await invoke('http_request', {
      req: {
        url: urls.url,
        method: urls.method,
        headers: header
      }
    });

    // 检查响应
    return response.body.code === urls.code;

  } catch (error) {
    logger.error(`[CheckLogin] ${channelName} 检测失败:`, error);
    return false;
  }


  // const config = CHANNEL_CONFIG[channelName.toLowerCase() as keyof typeof CHANNEL_CONFIG];

  // const cookies = JSON.parse(cookiesStr);
  // logger.info('[PositionSearch] 设置 Cookies...');
  //
  // for (const cookie of cookies) {
  //   await cdpService.sendCommand('Network.setCookie',  {
  //     name: cookie.name,
  //     value: cookie.value,
  //     domain: cookie.domain,
  //     path: cookie.path
  //   });
  // }
  //
  // // 3. 刷新页面验证登录
  // logger.info('[PositionSearch] 验证登录状态...');
  // await cdpService.clearNetworkEvents(); // 先清空
  // await mcpService.callTool('browser_navigate', { url: config.homeUrl });
  // await robotManager.sleep(3000); // 等待数据加载
  // const networkEvents = await cdpService.getNetworkEvents();
  // const loginEvents = networkEvents.filter(e => e.url.includes(config.loginCheckApi));
  //
  // let isLoggedIn = false;
  // if (loginEvents.length > 0) {
  //   const loginEvent = loginEvents.pop(); // 获取最后一个
  //
  //   if (loginEvent?.response_body) {
  //     try {
  //       const data = JSON.parse(loginEvent.response_body);
  //       isLoggedIn = data.code === config.loginSuccessCode;
  //     } catch (error) {
  //       logger.error('[PositionSearch] 解析登录响应失败:', error);
  //       await channelAuth.saveCookies(channelName, '');
  //       isLoggedIn = false;
  //     }
  //   }
  // }
  //
  // return isLoggedIn;
}
