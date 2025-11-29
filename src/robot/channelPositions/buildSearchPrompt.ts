import {SearchParams} from "@/robot/channelPositions/types.ts";
import * as boss from "./buildSearchPrompt/boss";
import * as zhilian from "./buildSearchPrompt/zhilian";
import * as guopin from "./buildSearchPrompt/guopin";

/**
 * 根据渠道名称选择对应的提示词构建器
 */
function getPromptBuilder(channelName: string) {
  switch (channelName) {
    case 'boss':
      return boss;
    case 'zhilian':
      return zhilian;
    case 'guopin':
      return guopin;
    default:
      return boss;
  }
}

/**
 * 构建单个任务的提示词
 */
export function buildSingleTaskPrompt(task: string, channelName: string): string {
  const builder = getPromptBuilder(channelName);
  return builder.buildSingleTaskPrompt(task);
}

/**
 * 构建任务列表
 */
export function buildTaskList(channelName: string, params: SearchParams): string[] {
  const builder = getPromptBuilder(channelName);
  return builder.buildTaskList(params);
}
