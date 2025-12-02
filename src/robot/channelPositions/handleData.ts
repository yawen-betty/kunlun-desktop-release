import * as boss from "./handleData/boss";
import * as zhilian from "./handleData/zhilian";
import * as guopin from "./handleData/guopin";

/**
 * 根据渠道名称选择对应方法
 */
function getDataBuilder(channelName: string) {
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
 * 职位处理方法
 */
export async function buildPositionData(info: any, channelName: string): Promise<any> {
  const builder = getDataBuilder(channelName);
  return await builder.buildPositionData(info);
}

/**
 * 公司处理方法
 */
export async function buildCompanyData(info: any, channelName: string): Promise<any> {
  const builder = getDataBuilder(channelName);
  return await builder.buildCompanyData(info);
}
