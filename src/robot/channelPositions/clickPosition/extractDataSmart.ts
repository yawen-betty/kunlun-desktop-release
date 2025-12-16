/**
 * 构建智能数据提取提示词（让 AI 自己分析页面结构）
 */
export function buildSmartExtractPrompt(): string {
  return `从当前职位详情页面提取信息，返回 JSON 格式。

需要提取的字段：
- title: 职位名称
- salary: 薪资范围（如：10-15K）
- salaryNumber: 薪资月数（如：13薪，如果没有则为空）
- areaName: 工作地区
- addresses: 详细地址数组
- description: 职位描述（完整内容）
- educational: 学历要求
- workExperience: 工作经验要求
- labels: 职位标签数组
- benefits: 福利待遇数组

执行步骤：
1. 使用 browser_evaluate 执行 JavaScript 提取数据
2. 根据页面实际结构调整选择器
3. 返回完整的 JSON 对象

规则：
- 必须使用 browser_evaluate 工具
- 找不到的字段设为空字符串或空数组
- 只返回 JSON 数据，不要其他说明
- 完成后立即返回结果

示例返回格式：
{
  "title": "高级前端工程师",
  "salary": "20-30K",
  "salaryNumber": "13薪",
  "areaName": "北京",
  "addresses": ["朝阳区xxx"],
  "description": "岗位职责：...",
  "educational": "本科",
  "workExperience": "3-5年",
  "labels": ["Vue", "React"],
  "benefits": ["五险一金", "带薪年假"]
}
`;
}
