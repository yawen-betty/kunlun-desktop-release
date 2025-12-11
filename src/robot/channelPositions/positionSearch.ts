import {mcpService, cdpService, aiService, robotManager} from '@/robot/service';
import {channelAuth} from '@/robot/channelLogin/authManage.ts';
import {logger} from '@/utiles/logger';
import type {SearchOptions, SearchResult} from '@/robot/channelPositions/types.ts';
import {CHANNEL_CONFIG, AI_TASK_TIMEOUT} from '@/robot/config.ts';
import {check} from '@/robot/checkLogin/index.ts';
import {buildTaskList, buildSingleTaskPrompt} from "@/robot/channelPositions/buildSearchPrompt.ts";
import {buildPositionData, buildCompanyData} from "@/robot/channelPositions/handleData.ts";
import {extractCompanyDetailByAI, extractPositionDetailByAI} from "@/robot/channelPositions/analysisData.ts";
import HttpClient from '@/api/HttpClient';
import {JobPaths} from '@/api/job/JobPaths';
import {CrawlPositionsInDto, CrawlPositionsOutDto} from "@/api/job/dto/CrawlPositions.ts";
import {ChannelPositionBean} from "@/api/job/dto/bean/ChannelPositionBean.ts";
import {invoke} from "@tauri-apps/api/core";
import {Result} from "@/api/BaseDto.ts";
import {CreateJobTaskOutDto} from "@/api/job/dto/CreateJobTask.ts";
import emitter from "@/utiles/eventBus.ts";
import {UserInfo} from "@/utiles/userInfo.ts";
import {MatchInfoBean} from "@/api/job/dto/bean/MatchInfoBean.ts";

// 任务运行状态
let isTaskRunning = false;
const http = new HttpClient();

/**
 * 执行职位搜索
 */
export async function executePositionSearch(options: SearchOptions, resumeText: string, taskId: string, prompt: string, isRunning: () => boolean): Promise<SearchResult> {
    // 并发控制
    if (isTaskRunning) {
        return {code: 500, message: '任务正在执行中，请稍后再试'};
    }

    isTaskRunning = true;
    // 在 executePositionSearch 内部创建 AbortController
    const abortController = new AbortController();
    // 监听外部停止信号，触发内部 abort
    const checkStop = () => {
        if (!isRunning()) {
            abortController.abort();
            throw new DOMException('Task stopped', 'AbortError');
        }
    };

    try {
        const {channelName, searchParams, apiKey} = options;
        const config = CHANNEL_CONFIG[channelName.toLowerCase() as keyof typeof CHANNEL_CONFIG];

        if (!config) {
            return {code: 500, message: `不支持的渠道: ${channelName}`};
        }

        // 1、获取所有标签页
        checkStop();
        const countNow = await tabCount();
        logger.info(`[PositionSearch] 当前有 ${countNow} 个标签页`);

        // 关闭除第一个外的所有标签页（从后往前关闭）
        if (countNow > 1) {
            for (let i = countNow - 1; i >= 1; i--) {
                logger.info(`[PositionSearch] 关闭标签页 ${i}`);
                checkStop();
                await mcpService.callTool('browser_tabs', {action: 'close', index: i});
                await robotManager.sleep(500);
            }
        }


        // 2. 验证登录
        logger.info('[PositionSearch] 获取 Cookies...');
        const cookiesStr = await channelAuth.getCookies(channelName);

        checkStop();
        const isLogin = await check(channelName, cookiesStr);

        if (!isLogin) {
            await channelAuth.saveCookies(channelName, '');
            await aiService.stopTask();
            return {code: 403, message: '未找到登录信息，请先登录'};
        }

        for (const cookie of JSON.parse(cookiesStr)) {
            await cdpService.sendCommand('Network.setCookie', {
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path
            });
        }

        // 3. 跳转到搜索页面
        logger.info('[PositionSearch] 跳转到搜索页面...');
        await mcpService.callTool('browser_navigate', {url: config.searchUrl});
        await robotManager.sleep(1000);

        await cdpService.clearNetworkEvents(); // 执行任务前先清空网络监听
        // 4. AI 逐个执行搜索任务
        logger.info('[PositionSearch] 执行搜索任务...');
        const tasks = buildTaskList(channelName, searchParams);

        for (let i = 0; i < tasks.length; i++) {
            checkStop();
            const task = tasks[i];
            logger.info(`[PositionSearch] 执行任务 ${i + 1}/${tasks.length}: ${task}`);

            const taskPrompt = buildSingleTaskPrompt(task, channelName);
            const taskResult = await executeAITask(taskPrompt, apiKey);

            if (!taskResult.success) {
                logger.warning(`[PositionSearch] 任务 ${i + 1} 失败: ${taskResult.message}`);
                // 继续执行下一个任务
            } else {
                logger.info(`[PositionSearch] 任务 ${i + 1} 完成`);
            }

            await robotManager.sleep(1000);
        }

        logger.info('[PositionSearch] 所有搜索任务执行完成')

        checkStop();
        const positionListNetwork = await cdpService.getNetworkEvents();
        const positionCountNet = positionListNetwork.filter(e => e.url.includes(config.positionCountUrl));
        if (positionCountNet.length > 0) {
            const positionCount = positionCountNet.pop(); // 获取最后一个
            if (positionCount?.response_body) {
                const countBody = JSON.parse(positionCount?.response_body);
                let count = 0;

                switch (channelName) {
                    case 'boss':
                        count = countBody?.zpData?.totalCount || 0;
                        break;
                    case 'zhilian':
                        count = countBody?.data?.count || 0;  // 确认是 body 还是 data
                        break;
                    case 'guopin':
                        count = countBody?.data?.total || 0;
                        break;
                }

                if (count === 0) {
                    return { code: 200, message: '暂无职位' };
                }
            }
        }

        // 5. AI 点击指定职位
        const max = 20;  // 获取条数

        for (let i = 1; i <= max; i++) {
            let dataInfo: ChannelPositionBean = new ChannelPositionBean(); // 获取的数据
            await cdpService.clearNetworkEvents(); // 执行任务前先清空网络监听
            logger.info(`[PositionClick] 执行第${i}条点击任务...`);

            checkStop();
            // 点击职位打开职位详情
            const clickPositionResult = await executeAITask(
                channelName === 'boss' ?
                    `请直接点击职位列表的第 ${i} 个职位项,然后点击页面右侧的'查看更多信息'` :
                    `请直接点击职位列表的第 ${i} 个职位项`, apiKey);
            logger.info(`[PositionClick] 任务完成`, clickPositionResult);

            checkStop();
            await robotManager.sleep(3000);

            // 刷新新 tab（此时监听已启用）
            await cdpService.executeScript('location.reload()');

            checkStop();
            await robotManager.sleep(3000); // 等待接口完成
            const positionNetwork = await cdpService.getNetworkEvents();
            // 获取职位详情
            logger.info('[PositionClick] 获取职位数据...');
            // 获取职位信息
            const guopinPositionInfoList = positionNetwork.filter(e => e.url.includes(config.positionNetUrl));
            logger.info('///////////////////////////////1', guopinPositionInfoList);
            if (guopinPositionInfoList.length > 0) {
                const guopinPositionInfo = guopinPositionInfoList.pop(); // 获取最后一个
                if (guopinPositionInfo?.response_body) {
                    const position = await buildPositionData(JSON.parse(guopinPositionInfo?.response_body), channelName);
                    dataInfo = Object.assign(dataInfo, position)
                    logger.info('///////////////////////////////2', position);
                }
            }
            // 获取所有 targets（包括新打开的 tab）
            const result = await cdpService.sendCommand('Target.getTargets', {});

            // 找到新打开的 tab
            const newTab = result.targetInfos.find((t: any) =>
                t.type === 'page' &&
                t.url.includes('detail') // 根据 URL 特征判断
            );
            console.log('newTab ==>', newTab)
            logger.info('newTab ==> ', newTab)
            logger.info('新 tab URL:', newTab.url);
            dataInfo = Object.assign(dataInfo, {
                jobDetailUrl: newTab.url
            })

            checkStop();
            await robotManager.sleep(3000);
            // 点击公司打开公司详情

            checkStop();
            await cdpService.clearNetworkEvents(); // 执行任务前先清空网络监听
            const clickCompanyResult = await executeAITask(`切换到浏览器最后一个标签页,点击页面右侧公司名称`, apiKey);
            logger.info(`[CompanyClick] 任务完成`, clickCompanyResult);

            checkStop();
            await robotManager.sleep(3000);

            // 刷新新 tab（此时监听已启用）
            await cdpService.executeScript('location.reload()');

            checkStop();
            await robotManager.sleep(3000); // 等待接口完成
            const companyNetwork = await cdpService.getNetworkEvents();

            // 获取公司详情
            logger.info('[PositionClick] 获取公司数据...');

            const guopinCompanyInfoList = companyNetwork.filter(e => e.url.includes(config.companyNetUrl));
            logger.info('///////////////////////////////3', guopinCompanyInfoList);
            logger.info('获取到公司接口:', guopinCompanyInfoList);
            if (guopinCompanyInfoList.length > 0) {
                const guopinCompanyInfo = guopinCompanyInfoList.pop(); // 获取最后一个

                if (guopinCompanyInfo?.response_body) {
                    const company = await buildCompanyData(JSON.parse(guopinCompanyInfo.response_body), channelName);
                    dataInfo = Object.assign(dataInfo, company)
                    logger.info('///////////////////////////////4', company);
                }
            }

            // 匹配
            checkStop();
            try {

                let matchJobRes = await matchJob(apiKey, resumeText, dataInfo, prompt, abortController.signal);
                while (matchJobRes === 1305) {
                    logger.warning('[PositionSearch] AI 请求频率限制，等待 60 秒');
                    checkStop();
                    await robotManager.sleep(1000 * 60);
                    checkStop();
                    matchJobRes = await matchJob(apiKey, resumeText, dataInfo, prompt, abortController.signal);
                }

                // 发送数据给接口
                await crawlPositions(dataInfo, taskId, matchJobRes);
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    logger.info('[PositionSearch] matchJob 已被取消');
                    return { code: 499, message: '任务已被停止' };
                }
                throw error; // 重新抛出其他错误
            }

            checkStop();
            // 获取所有标签页
            const count = await tabCount();
            logger.info(`[PositionSearch] 当前有 ${count} 个标签页`);

            // 关闭除第一个外的所有标签页（从后往前关闭）
            for (let i = count - 1; i >= 1; i--) {
                logger.info(`[PositionSearch] 关闭标签页 ${i}`);
                checkStop();
                await mcpService.callTool('browser_tabs', {action: 'close', index: i});
                await robotManager.sleep(500);
            }
            // 每条间短暂延迟
            checkStop();
            await robotManager.sleep(1000 * 60);
        }

        await robotManager.sleep(1000); // 等待数据加载
        checkStop();
        await aiService.stopTask();
        return {
            code: 200,
            message: '执行成功'
        };

    } catch (error:any) {
        if (error.name === 'AbortError') {
            logger.info('[PositionSearch] 任务已被取消');
            return { code: 499, message: '任务已被停止' };
        }
        logger.error('[PositionSearch] 执行失败:', error);
        await aiService.stopTask();
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
            return {success: true, message: resultStr};
        }

        return {success: false, message: resultStr};
    } catch (error) {
        // 超时或失败时，停止后台任务避免并发
        logger.warning('[PositionSearch] 任务失败，停止后台任务');
        try {
            await aiService.stopTask();
        } catch (stopError) {
            logger.error('[PositionSearch] 停止任务失败:', stopError);
        }
        return {success: false, message: String(error)};
    }
}

/**
 * 解析tab页的数量
 */
async function tabCount(): Promise<number> {
    // 获取所有标签页
    const tabsResult = await mcpService.callTool('browser_tabs', {action: 'list'});
    logger.info('[PositionSearch] 标签页列表:', tabsResult);

    // 解析标签页数据
    const tabsData = tabsResult.content?.[0]?.text || '';
    const tabLines = tabsData.split('\n').filter((line: string) => line.trim().startsWith('-'));
    const tabCount = tabLines.length;

    return tabCount || 0;
}

/**
 * 调用接口上传数据
 */
async function crawlPositions(data: ChannelPositionBean, taskId: string, matchInfo: MatchInfoBean) {
    const res = await http.request<Result<CrawlPositionsOutDto>>(JobPaths.crawlPositions, {
        taskUuid: taskId,
        positions: data,
        matchInfo
    });

    // 推荐职位已达上限
    if (res.code === 2601) {
        // 停止机器人爬取；同时弹出「今日推荐次数已用完，请明日再来！」弹窗。
        emitter.emit('exhaustedOfAttempts')
    } else if (res.code === 200) {
        // 入库成功，通知页面UI更新
        emitter.emit('updateNewPosition')
    }
}

/**
 * 匹配
 */
async function matchJob(apiKey: string, resumeText: string, positionInfo: any, prompt: string, signal: AbortSignal ): Promise<any> {
    const parts: string[] = [];

    if (positionInfo.title) {
        parts.push(`职位名称：${positionInfo.title}`);
    }
    if (positionInfo.areaName) {
        parts.push(`工作地址：${positionInfo.areaName}`);
    }
    if (positionInfo.educational) {
        parts.push(`学历要求：${positionInfo.educational}`);
    }
    if (positionInfo.workExperience) {
        parts.push(`工作经验：${positionInfo.workExperience}`);
    }
    if (positionInfo.salary) {
        parts.push(`薪资范围：${positionInfo.salary}`);
    }
    if (positionInfo.salaryNumber) {
        parts.push(`薪资结构：${positionInfo.salaryNumber}`);
    }
    if (positionInfo.labels?.length) {
        parts.push(`职位标签：${positionInfo.labels.join(',')}`);
    }
    if (positionInfo.description) {
        parts.push(`职位描述：${positionInfo.description}`);
    }

    const positionContent = parts.join('\n');
    const userContent = `
    简历文本：
    ${resumeText}
    职位要求：
    ${positionContent}`;

    const message = [
        {
            "role": "system",
            "content": prompt
        },
        {
            "role": "user",
            "content": userContent
        }
    ];


    console.info('========================msg', message)

    const httpPromise: any = invoke('http_request', {
        req: {
            url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: {
                "model": 'glm-4.5-flash',
                "temperature": 0.8,
                "max_tokens": 65536,
                "stream": false,
                "thinking": {
                    "type": "enabled"
                },
                "do_sample": true,
                "top_p": 0.6,
                "tool_stream": false,
                "response_format": {
                    "type": "text"
                },
                "messages": message
            }
        }
    });
    let response: any;

    const abortPromise = new Promise((_, reject) => {
        signal.addEventListener('abort', () => {
            reject(new DOMException('Request aborted', 'AbortError'));
        });
    });
    response = await Promise.race([httpPromise, abortPromise]);

    console.info('========================匹配', response)

    // 配置超时重试
    if (response.body.error) {
        if (response.body.error.code === '1305') { // API 请求过多
            return 1305;
        } else {
            return new MatchInfoBean();
        }
    }
    if (response.body.choices && response.body.choices.length > 0) {
        const msg = response.body.choices[0].message;
        if (msg && msg.content) {
            const matchInfo = parseMatchInfo(msg.content);
            console.log(matchInfo);
            console.info('========================清洗数据', matchInfo)
            return matchInfo
        } else {
            return new MatchInfoBean();
        }
    } else {
        return new MatchInfoBean();
    }
}

function parseMatchInfo(content: string): MatchInfoBean {
    // 1. 提取 JSON 部分（支持代码块格式或直接JSON字符串）
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
        content.match(/(\{[\s\S]*})/);

    let jsonStr = '';
    if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
    } else {
        // 如果没有匹配到，直接使用原始内容
        jsonStr = content;
    }

    // 2. 使用浏览器原生 HTML 解码器
    const textarea = document.createElement('textarea');
    textarea.innerHTML = jsonStr;
    const decodedStr = textarea.value;

    // 3. 解析 JSON
    const data = JSON.parse(decodedStr);

    // 4. 转换为 MatchInfoBean
    const matchInfo = new MatchInfoBean();
    matchInfo.jobPositionMatchScore = data.jobPositionMatchScore || '';
    matchInfo.summaryAndSuggestion = data.summaryAndSuggestion || '';
    matchInfo.relatedDimensionAnalysisList = data.relatedDimensionAnalysisList || [];

    return matchInfo;
}
