import {SearchParams} from "@/robot/channelPositions/types.ts";

/**
 * 构建单个任务的提示词
 */
export function buildSingleTaskPrompt(task: string): string {
  return `当前在国聘网的搜索页面。

**任务：${task}**

规则：
- 禁止使用 browser_select_option
- 禁止使用 browser_navigate
- 所有筛选条件用 browser_click 点击
`;
}

/**
 * 构建任务列表
 */
export function buildTaskList(params: SearchParams): string[] {
  const tasks: string[] = [];

  if (params.jobTitle) {
    tasks.push(`搜索"${params.jobTitle}"职位`);
  }

  if (params.cityInfos) {
    tasks.push(`城市选择"${params.cityInfos}"`);
  }

  if (params.experience) {
    tasks.push(`薪资待遇选择"${params.experience}"`);
  }

  return tasks;
}
