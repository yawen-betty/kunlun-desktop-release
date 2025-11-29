# Playwright MCP 任务处理模块

提供两个核心任务类，用于处理招聘网站的自动化操作。

## 任务类

### 1. AuthTokenExtractor（认证 Token 提取器）

**功能：** 打开网站，等待用户手动登录，提取登录后的认证信息。

**使用示例：**
```typescript
import { AuthTokenExtractor } from '@/playwrightMcp';

// 创建提取器
const extractor = new AuthTokenExtractor('https://www.zhaopin.com');

// 设置参数（可选）
extractor
  .setCheckInterval(2000)      // 每2秒检查一次登录状态
  .setMaxWaitTime(300000);     // 最多等待5分钟

// 执行任务
const authData = await extractor.execute();

if (authData.success) {
  console.log('Token:', authData.token);
  console.log('Cookies:', authData.cookies);
  console.log('LocalStorage:', authData.localStorage);
  
  // 保存认证数据供后续使用
  localStorage.setItem('zhaopin_auth', JSON.stringify(authData));
}
```

**返回数据结构：**
```typescript
interface AuthTokenResult {
  success: boolean;
  url: string;
  token?: string;                    // 提取的 Token
  cookies?: Array<{                  // Cookie 列表
    name: string;
    value: string;
    domain: string;
    path: string;
  }>;
  localStorage?: Record<string, string>;    // LocalStorage 数据
  sessionStorage?: Record<string, string>;  // SessionStorage 数据
  error?: string;
  timestamp: number;
}
```

### 2. JobSearcher（职位搜索器）

**功能：** 使用已有的认证信息登录网站，根据条件搜索职位并提取数据。

**使用示例：**
```typescript
import { JobSearcher } from '@/playwrightMcp';

// 加载之前保存的认证数据
const authData = JSON.parse(localStorage.getItem('zhaopin_auth')!);

// 创建搜索器
const searcher = new JobSearcher('https://www.zhaopin.com', authData);

// 执行搜索
const result = await searcher.search({
  keyword: 'Java开发',
  location: '北京',
  salary: '15k-30k',
  experience: '3-5年',
  education: '本科',
  limit: 20,
  // 可选：自定义选择器
  searchInputSelector: '#keyword',
  searchButtonSelector: '.search-btn'
});

if (result.success) {
  console.log(`找到 ${result.total} 个职位`);
  result.jobs.forEach(job => {
    console.log(`${job.title} - ${job.company} - ${job.salary}`);
  });
}
```

**搜索条件：**
```typescript
interface SearchCriteria {
  keyword: string;                    // 必填：搜索关键词
  location?: string;                  // 工作地点
  salary?: string;                    // 薪资范围
  experience?: string;                // 工作经验
  education?: string;                 // 学历要求
  limit?: number;                     // 返回数量（默认10）
  searchInputSelector?: string;       // 自定义搜索框选择器
  searchButtonSelector?: string;      // 自定义搜索按钮选择器
}
```

**返回数据结构：**
```typescript
interface JobSearchResult {
  success: boolean;
  criteria: SearchCriteria;
  jobs: JobInfo[];                    // 职位列表
  total: number;                      // 职位总数
  error?: string;
  timestamp: number;
}

interface JobInfo {
  title: string;                      // 职位名称
  company?: string;                   // 公司名称
  salary?: string;                    // 薪资
  location?: string;                  // 地点
  experience?: string;                // 经验要求
  education?: string;                 // 学历要求
  link?: string;                      // 职位链接
}
```

## 完整工作流程

```typescript
import { AuthTokenExtractor, JobSearcher } from '@/playwrightMcp';

// 步骤1：获取认证信息（只需执行一次）
async function getAuth() {
  const extractor = new AuthTokenExtractor('https://www.zhaopin.com');
  const authData = await extractor.execute();
  
  if (authData.success) {
    // 保存认证数据
    localStorage.setItem('zhaopin_auth', JSON.stringify(authData));
    return authData;
  }
  throw new Error('登录失败');
}

// 步骤2：使用认证信息搜索职位（可多次执行）
async function searchJobs(keyword: string) {
  const authData = JSON.parse(localStorage.getItem('zhaopin_auth')!);
  const searcher = new JobSearcher('https://www.zhaopin.com', authData);
  
  return await searcher.search({
    keyword,
    location: '北京',
    limit: 20
  });
}

// 使用
const authData = await getAuth();
const result = await searchJobs('Java');
```

## 支持的网站

理论上支持所有招聘网站，包括但不限于：
- 智联招聘 (zhaopin.com)
- Boss直聘 (zhipin.com)
- 拉勾网 (lagou.com)
- 前程无忧 (51job.com)

不同网站可能需要调整选择器参数。

## 注意事项

1. **MCP Server 必须先启动**
2. **任务1（获取Token）建议使用有头模式**，方便用户看到登录界面
3. **任务2（搜索职位）可以使用无头模式**，提高效率
4. **认证数据有时效性**，过期后需要重新获取
5. **不同网站的页面结构不同**，可能需要自定义选择器
