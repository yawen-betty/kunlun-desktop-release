import {mcpService, cdpService, aiService, robotManager} from '@/robot/service';
import { channelAuth } from '@/robot/channelLogin/authManage.ts';
import { logger } from '@/utiles/logger';
import type { SearchOptions, SearchResult } from '@/robot/channelPositions/types.ts';
import { CHANNEL_CONFIG, AI_TASK_TIMEOUT } from '@/robot/config.ts';
import {check} from '@/robot/checkLogin/index.ts';
import {buildTaskList, buildSingleTaskPrompt} from "@/robot/channelPositions/buildSearchPrompt.ts";
import {buildPositionData, buildCompanyData} from "@/robot/channelPositions/handleData.ts";
import {extractCompanyDetailByAI, extractPositionDetailByAI} from "@/robot/channelPositions/analysisData.ts";

// 任务运行状态
let isTaskRunning = false;

/**
 * 执行职位搜索
 */
export async function executePositionSearch(options: SearchOptions): Promise<SearchResult> {
  // 并发控制
  if (isTaskRunning) {
    return { code: 500, message: '任务正在执行中，请稍后再试' };
  }

  isTaskRunning = true;

  try {
    const { channelName, searchParams, apiKey } = options;
    const config = CHANNEL_CONFIG[channelName.toLowerCase() as keyof typeof CHANNEL_CONFIG];

    if (!config) {
      return { code: 500, message: `不支持的渠道: ${channelName}` };
    }

    // 1. 启动 MCP + CDP
    logger.info('[PositionSearch] 启动 MCP Server...');
    await mcpService.start(true);

    logger.info('[PositionSearch] 初始化 CDP...');
    await cdpService.init();

    // 2. 验证登录
    logger.info('[PositionSearch] 获取 Cookies...');
    const cookiesStr = await channelAuth.getCookies(channelName);

    const isLogin = await check(channelName, cookiesStr);

    if (!isLogin) {
      await channelAuth.saveCookies(channelName, '');
      await robotManager.cleanup();
      return { code: 403, message: '未找到登录信息，请先登录' };
    }

    // 3. 跳转到搜索页面
    logger.info('[PositionSearch] 跳转到搜索页面...');
    await cdpService.clearNetworkEvents(); // 先清空网络监听
    await mcpService.callTool('browser_navigate', { url: config.searchUrl });
    await robotManager.sleep(1000);

    // 4. AI 逐个执行搜索任务
    // logger.info('[PositionSearch] 执行搜索任务...');
    // const tasks = buildTaskList(channelName, searchParams);
    //
    // for (let i = 0; i < tasks.length; i++) {
    //   const task = tasks[i];
    //   logger.info(`[PositionSearch] 执行任务 ${i + 1}/${tasks.length}: ${task}`);
    //
    //   const taskPrompt = buildSingleTaskPrompt(task,channelName);
    //   const taskResult = await executeAITask(taskPrompt, apiKey);
    //
    //   if (!taskResult.success) {
    //     logger.warning(`[PositionSearch] 任务 ${i + 1} 失败: ${taskResult.message}`);
    //     // 继续执行下一个任务
    //   } else {
    //     logger.info(`[PositionSearch] 任务 ${i + 1} 完成`);
    //   }
    //
    //   await sleep(1000);
    //   // 任务间短暂延迟
    //   await sleep(200);
    // }
    //
    // logger.info('[PositionSearch] 所有搜索任务执行完成')

    // 5. AI 点击指定职位
    const max = 1;  // 获取条数

    for (let i = 1; i <= max; i++) {
      let dataInfo = {}; // 获取的数据
      await cdpService.clearNetworkEvents(); // 执行任务前先清空网络监听
      logger.info(`[PositionClick] 执行第${i}条点击任务...`);

      // 点击职位打开职位详情
      const clickPositionResult = await executeAITask(`请直接点击职位列表的第 ${i} 个职位项，不要点击任何筛选、清空或其他按钮`, apiKey);
      logger.info(`[PositionClick] 任务完成`,clickPositionResult);
      await robotManager.sleep(3000);

      // 刷新新 tab（此时监听已启用）
      await cdpService.executeScript('location.reload()');
      await robotManager.sleep(3000); // 等待接口完成
      const positionNetwork = await cdpService.getNetworkEvents();
      // 获取职位详情
      logger.info('[PositionClick] 获取职位数据...');
      // 获取职位信息
      const guopinPositionInfoList = positionNetwork.filter(e => e.url.includes(config.positionNetUrl));
      logger.info('///////////////////////////////1',guopinPositionInfoList);
      if (guopinPositionInfoList.length > 0) {
        const guopinPositionInfo = guopinPositionInfoList.pop(); // 获取最后一个
        if (channelName === 'guopin') {
          if (guopinPositionInfo?.response_body) {
            const position = buildPositionData(JSON.parse(guopinPositionInfo?.response_body),'guopin');
            dataInfo = Object.assign(dataInfo,position)
            logger.info('///////////////////////////////2',position);
          }
        }
      }
      // 获取所有 targets（包括新打开的 tab）
      const result = await cdpService.sendCommand('Target.getTargets', {});

      // 找到新打开的 tab
      const newTab = result.targetInfos.find((t:any) =>
        t.type === 'page' &&
        t.url.includes('detail') // 根据 URL 特征判断
      );

      logger.info('新 tab URL:', newTab.url);
      dataInfo = Object.assign(dataInfo,{
        jobDetailUrl: newTab.url
      })
      await robotManager.sleep(3000);
      // 点击公司打开公司详情
      await cdpService.clearNetworkEvents(); // 执行任务前先清空网络监听
      const clickCompanyResult = await executeAITask(`切换到浏览器最后一个标签页,点击页面右侧公司名称`, apiKey);
      logger.info(`[CompanyClick] 任务完成`,clickCompanyResult);
      await robotManager.sleep(3000);

      // 刷新新 tab（此时监听已启用）
      await cdpService.executeScript('location.reload()');
      await robotManager.sleep(3000); // 等待接口完成
      const companyNetwork = await cdpService.getNetworkEvents();

      // 获取公司详情
      logger.info('[PositionClick] 获取公司数据...');

      const guopinCompanyInfoList = companyNetwork.filter(e => e.url.includes(config.companyNetUrl));
      logger.info('///////////////////////////////3',guopinCompanyInfoList);
      logger.info('获取到公司接口:', guopinCompanyInfoList);
      if (guopinCompanyInfoList.length > 0) {
        const guopinCompanyInfo = guopinCompanyInfoList.pop(); // 获取最后一个

        if (channelName === 'guopin') {
          if (guopinCompanyInfo?.response_body) {
            const company = buildCompanyData(JSON.parse(guopinCompanyInfo.response_body),'guopin');
            dataInfo = Object.assign(dataInfo,company)
            logger.info('///////////////////////////////4',company);
          }
        }
      }

      // TODO 调用润扬提供的方法把 dataInfo 发送出去


      // 获取所有标签页
      const count = await tabCount();
      logger.info(`[PositionSearch] 当前有 ${count} 个标签页`);

      // 关闭除第一个外的所有标签页（从后往前关闭）
      for (let i = count - 1; i >= 1; i--) {
        logger.info(`[PositionSearch] 关闭标签页 ${i}`);
        await mcpService.callTool('browser_tabs', { action: 'close', index: i });
        await robotManager.sleep(500);
      }
      // 每条间短暂延迟
      await robotManager.sleep(1000*60);


      // 点击职位打开职位详情
      // const clickTaskResult = await executeAITask(`请直接点击职位列表的第 ${i} 个职位项，不要点击任何筛选、清空或其他按钮`, apiKey);
      // logger.info(`[PositionClick] 任务 ${i + 1} 完成`,clickTaskResult);
      // await sleep(3000);
      //
      // // 获取标签页列表
      // const counts = await tabCount();
      //
      // // 切换到最后一个标签页（新打开的）
      // await mcpService.callTool('browser_tabs', { action: 'select', index: counts - 1 });
      // await sleep(1000); // 等待页面加载
      //
      //
      // // 使用 AI 提取职位详情
      // const positionDetail = await extractPositionDetailByAI(apiKey, channelName);
      // logger.info(`[positionDetail] 职位详情提取完成:`, positionDetail);
      // await sleep(1000);
      //
      // // 获取职位详情页 URL
      // const positionUrl = await cdpService.executeScript('window.location.href');
      // logger.info(`[PositionClick] 职位详情页 URL: ${positionUrl}`);
      // await sleep(3000);
      //
      // // 点击公司名称打开公司详情
      // const clickCompany = await executeAITask(`点击页面右侧公司名称`, apiKey);
      // logger.info(`[clickCompany] 打开公司详情任务完成:`, clickCompany);
      // await sleep(3000);
      //
      // // 使用AI提取公司详情
      // const companyDetail = await extractCompanyDetailByAI(apiKey, channelName);
      // logger.info(`[companyDetail] 公司详情提取完成:`, companyDetail);
      //
      // // 获取所有标签页
      // const count = await tabCount();
      //
      // logger.info(`[PositionSearch] 当前有 ${count} 个标签页`);
      //
      // // 关闭除第一个外的所有标签页（从后往前关闭）
      // for (let i = count - 1; i >= 1; i--) {
      //   logger.info(`[PositionSearch] 关闭标签页 ${i}`);
      //   await mcpService.callTool('browser_tabs', { action: 'close', index: i });
      //   await sleep(500);
      // }
      // // 每条间短暂延迟
      // await sleep(3000);
    }

    await robotManager.sleep(1000); // 等待数据加载

    await robotManager.cleanup();

    return {
      code: 200,
      message: '搜索成功'
    };

  } catch (error) {
    logger.error('[PositionSearch] 执行失败:', error);
    await robotManager.cleanup();
    return {
      code: 500,
      message: String(error)
    };
  } finally {
    isTaskRunning = false;
  }
}

/**
 * 执行 AI 任务
 */
async function executeAITask(prompt: string, apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await aiService.executeTask(apiKey, prompt);
    const resultStr = result.message || JSON.stringify(result);

    if (result.success) {
      return { success: true, message: resultStr };
    }

    return { success: false, message: resultStr };
  } catch (error) {
    // 超时或失败时，停止后台任务避免并发
    logger.warning('[PositionSearch] 任务失败，停止后台任务');
    try {
      await aiService.stopTask();
    } catch (stopError) {
      logger.error('[PositionSearch] 停止任务失败:', stopError);
    }
    return { success: false, message: String(error) };
  }
}

/**
 * 解析tab页的数量
 */
async function tabCount(): Promise<number> {
  // 获取所有标签页
  const tabsResult = await mcpService.callTool('browser_tabs', { action: 'list' });
  logger.info('[PositionSearch] 标签页列表:', tabsResult);

  // 解析标签页数据
  const tabsData = tabsResult.content?.[0]?.text || '';
  const tabLines = tabsData.split('\n').filter((line: string) => line.trim().startsWith('-'));
  const tabCount = tabLines.length;

  return tabCount || 0;
}
