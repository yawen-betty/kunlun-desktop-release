/**
 * Playwright MCP 任务处理模块
 * 
 * 提供两个核心任务类：
 * 1. AuthTokenExtractor - 认证 Token 提取器
 * 2. JobSearcher - 职位搜索器
 */

export { AuthTokenExtractor } from './AuthTokenExtractor';
export type { AuthTokenResult } from './AuthTokenExtractor';

export { JobSearcher } from './JobSearcher';
export type { SearchCriteria, JobInfo, JobSearchResult } from './JobSearcher';

/**
 * 使用示例：
 * 
 * // 任务1：获取登录 Token
 * const extractor = new AuthTokenExtractor('https://www.zhaopin.com');
 * const authData = await extractor.execute();
 * 
 * // 任务2：使用 Token 搜索职位
 * const searcher = new JobSearcher('https://www.zhaopin.com', authData);
 * const result = await searcher.search({
 *   keyword: 'Java',
 *   location: '北京',
 *   limit: 10
 * });
 */
