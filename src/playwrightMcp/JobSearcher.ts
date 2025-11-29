import { invoke } from '@tauri-apps/api/core';
import type { AuthTokenResult } from './AuthTokenExtractor';

/**
 * 职位搜索器
 * 
 * 任务2：使用 AI + Token 登录网站，搜索职位
 */
export class JobSearcher {
  private url: string;
  private authData: AuthTokenResult;
  private apiKey: string;

  constructor(url: string, authData: AuthTokenResult, apiKey: string) {
    this.url = url;
    this.authData = authData;
    this.apiKey = apiKey;
  }

  /**
   * 执行搜索任务
   */
  async search(criteria: SearchCriteria): Promise<JobSearchResult> {
    try {
      // 1. 先注入认证信息
      await this.injectAuthData();

      // 2. 使用 AI 执行搜索任务
      const task = `
请执行以下任务：
1. 打开网站 ${this.url}（认证信息已注入，应该是登录状态）
2. 在搜索框中输入关键词：${criteria.keyword}
${criteria.location ? `3. 选择或输入地点：${criteria.location}` : ''}
${criteria.salary ? `4. 选择薪资范围：${criteria.salary}` : ''}
${criteria.experience ? `5. 选择工作经验：${criteria.experience}` : ''}
${criteria.education ? `6. 选择学历要求：${criteria.education}` : ''}
7. 点击搜索按钮
8. 等待搜索结果加载
9. 提取前 ${criteria.limit || 10} 个职位的以下信息：
   - 职位名称
   - 公司名称
   - 薪资
   - 工作地点
   - 经验要求
   - 学历要求
   - 职位链接
10. 将提取的数据以 JSON 数组格式返回

注意：
- 使用 browser_snapshot 查看页面结构
- 使用 browser_type 输入文本
- 使用 browser_click 点击按钮
- 使用 browser_evaluate 提取数据
- 如果遇到验证码或其他问题，请说明
      `.trim();

      const result: any = await invoke('ai_execute_task', {
        apiKey: this.apiKey,
        task
      });

      // 解析 AI 返回的结果
      const jobs = this.parseAIResult(result.message);

      return {
        success: true,
        criteria,
        jobs,
        total: jobs.length,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        criteria,
        jobs: [],
        total: 0,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      };
    }
  }

  /**
   * 注入认证数据
   */
  private async injectAuthData(): Promise<void> {
    // 注入 Cookies
    if (this.authData.cookies && this.authData.cookies.length > 0) {
      await invoke('cdp_set_cookies', {
        cookies: this.authData.cookies
      });
    }

    // 注入 LocalStorage
    if (this.authData.localStorage) {
      for (const [key, value] of Object.entries(this.authData.localStorage)) {
        await invoke('cdp_set_local_storage', { key, value });
      }
    }

    // 注入 Token（如果有）
    if (this.authData.token) {
      await invoke('cdp_set_local_storage', {
        key: 'token',
        value: this.authData.token
      });
    }
  }

  /**
   * 解析 AI 返回的结果
   */
  private parseAIResult(message: string): JobInfo[] {
    try {
      // 尝试从 AI 的回复中提取 JSON 数据
      const jsonMatch = message.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch {
      return [];
    }
  }
}

/**
 * 搜索条件
 */
export interface SearchCriteria {
  keyword: string;                    // 搜索关键词
  location?: string;                  // 工作地点
  salary?: string;                    // 薪资范围
  experience?: string;                // 工作经验
  education?: string;                 // 学历要求
  limit?: number;                     // 返回数量限制
  searchInputSelector?: string;       // 搜索框选择器
  searchButtonSelector?: string;      // 搜索按钮选择器
}

/**
 * 职位信息
 */
export interface JobInfo {
  title: string;                      // 职位名称
  company?: string;                   // 公司名称
  salary?: string;                    // 薪资
  location?: string;                  // 地点
  experience?: string;                // 经验要求
  education?: string;                 // 学历要求
  link?: string;                      // 职位链接
}

/**
 * 搜索结果
 */
export interface JobSearchResult {
  success: boolean;
  criteria: SearchCriteria;
  jobs: JobInfo[];
  total: number;
  error?: string;
  timestamp: number;
}
