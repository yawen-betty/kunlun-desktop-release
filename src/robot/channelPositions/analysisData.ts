import { aiService } from '@/robot/service';
import { logger } from '@/utiles/logger';
import {buildSmartExtractPrompt} from "@/robot/channelPositions/clickPosition/extractDataSmart.ts";

/**
 * 职位详情数据
 */
export interface PositionDetail {
  name: string;           // 职位名称
  salary: string;         // 薪资范围
  salaryMonths: string;   // 薪资月数
  location: string;       // 工作地区
  addresses: string[];    // 工作地址
  description: string;    // 职位描述
  education: string;      // 学历要求
  experience: string;     // 工作经验
  tags: string[];           // 职位标签
  benefits: string[];       // 福利待遇
}

/**
 * 公司详情数据
 */
export interface CompanyDetail {
  companyName: string;      // 公司名称
  introduce: string;        // 公司简介
  industry: string;         // 公司行业
  size: string;             // 公司规模
  natures: string;          // 公司性质
  financingStage: string;   // 融资阶段
  companyAddress: string[]; // 公司地址
  companyLabel: string[];   // 公司标签
}

/**
 * 构建提取提示词
 */
function buildExtractPrompt(fieldName: string, pageType: 'position' | 'company', example?: string): string {
  const pageText = pageType === 'position' ? '职位详情页' : '公司详情页';
  const exampleText = example ? `（${example}）` : '';
  return `当前页面是${pageText}，提取${fieldName}${exampleText}并返回。
规则：找不到返回空，多个用逗号分隔，只返回数据不要其他内容。`;
}

/**
 * 提取单个字段
 */
async function extractField(apiKey: string, fieldName: string, pageType: 'position' | 'company', example?: string): Promise<string> {
  await sleep(500);
  try {
    const result = await aiService.executeTask(apiKey, buildExtractPrompt(fieldName, pageType, example));
    if (result.success) {
      const value = result.message.trim();
      logger.info(`[AnalysisData] ${fieldName}: ${value}`);
      return value;
    }
  } catch (error) {
    logger.error(`[AnalysisData] 提取${fieldName}失败:`, error);
  }
  return '';
}

/**
 * 提取数组字段
 */
async function extractArrayField(apiKey: string, fieldName: string, pageType: 'position' | 'company'): Promise<string[]> {
  const value = await extractField(apiKey, fieldName, pageType);
  return value ? value.split(',').map(v => v.trim()).filter(v => v) : [];
}

/**
 * 使用 AI 提取职位详情
 * @param apiKey - AI API 密钥
 * @param channelName - 渠道名称
 * @returns 职位详情数据
 */
export async function extractPositionDetailByAI(apiKey: string, channelName: string): Promise<any> {
  logger.info('[AnalysisData] 开始提取职位详情...');

  // const detail: PositionDetail = {
  //   name: await extractField(apiKey, '职位名称', 'position'),
  //   salary: await extractField(apiKey, '薪资范围', 'position', '如：10-15K'),
  //   salaryMonths: await extractField(apiKey, '薪资月数', 'position', '如：13薪'),
  //   location: await extractField(apiKey, '工作地区', 'position'),
  //   addresses: await extractArrayField(apiKey, '工作地址', 'position'),
  //   description: await extractField(apiKey, '职位描述', 'position'),
  //   education: await extractField(apiKey, '学历要求', 'position'),
  //   experience: await extractField(apiKey, '工作经验要求', 'position'),
  //   tags: await extractArrayField(apiKey, '职位标签', 'position'),
  //   benefits: channelName.toLowerCase() === 'guopin' ? [] : await extractArrayField(apiKey, '福利待遇', 'position'),
  // };
  const p = buildSmartExtractPrompt();
  const detail = await aiService.executeTask(apiKey, p);

  logger.info('[AnalysisData] 职位详情提取完成',detail);
  return detail;
}

/**
 * 使用 AI 提取公司详情
 * @param apiKey - AI API 密钥
 * @returns 公司详情数据
 */
export async function extractCompanyDetailByAI(apiKey: string, channelName: string): Promise<CompanyDetail> {
  logger.info('[AnalysisData] 开始提取公司详情...');

  const detail: CompanyDetail = {
    companyName: await extractField(apiKey, '公司名称', 'company'),
    introduce: await extractField(apiKey, '公司简介', 'company'),
    industry: await extractField(apiKey, '公司行业', 'company'),
    size: await extractField(apiKey, '公司规模', 'company', '如：100-500人'),
    natures: channelName.toLowerCase() === 'boss' ? '' : await extractField(apiKey, '公司性质', 'company', '如：民营企业'),
    financingStage: await extractField(apiKey, '融资阶段', 'company', '如：A轮'),
    companyAddress: await extractArrayField(apiKey, '公司地址', 'company'),
    companyLabel: channelName.toLowerCase() === 'guopin' ? [] :  await extractArrayField(apiKey, '公司标签', 'company'),
  };

  logger.info('[AnalysisData] 公司详情提取完成');
  return detail;
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
