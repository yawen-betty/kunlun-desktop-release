/**
 * 搜索参数
 */
export interface SearchParams {
  /** 职位名称 */
  jobTitle?: string;
  /** 城市/地址 */
  cityInfos?: string;
  /** 薪资范围 */
  experience?: string;
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  /** 渠道名称 */
  channelName: string;
  /** 搜索参数 */
  searchParams: SearchParams;
  /** API Key */
  apiKey: string;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 状态码 */
  code: 200 | 403 | 400 | 500 | number;
  /** 消息 */
  message: string;
  /** 数据 */
  data?: any;
}
