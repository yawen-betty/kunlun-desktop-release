import {SearchParams} from "@/robot/channelPositions/types.ts";

/**
 * 构建单个任务的提示词
 */
export function buildSingleTaskPrompt(task: string): string {
  return `当前在智联招聘的搜索页面。

**任务：${task}**

执行要求：
1. 点击对应的筛选项
2. 等待页面响应（使用 browser_wait_for 或等待 2 秒）
3. 使用 browser_snapshot 验证结果
4. 如果第一次失败，尝试重新点击
5. 最多尝试 2 次

返回格式：
- 成功：明确说明"已成功设置为 XXX"
- 失败：说明"设置失败，原因：XXX"

规则：
- 禁止使用 browser_select_option
- 禁止使用 browser_navigate
- 所有筛选条件用 browser_click 点击
- **必须验证结果，不要假设成功**
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

  tasks.push(`
    请完成以下筛选设置：
    地点选择"${params.cityInfos}",
    薪资要求选择"${params.experience}",
    职位类型选择"全职"
  `);
  // if (params.cityInfos) {
  //   tasks.push(`地点选择"${params.cityInfos}"`);
  // }
  //
  // if (params.experience) {
  //   tasks.push(`薪资要求选择"${params.experience}"`);
  // }
  //
  // tasks.push(`职位类型选择"全职"`);

  return tasks;
}
