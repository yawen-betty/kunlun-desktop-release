import {cdpService} from "@/robot/service";

/**
 * 提取单个字段
 */
async function execScript(s: string): Promise<string> {
  await sleep(1000);
  try {
    const result = await cdpService.executeScript(s);
    return result.result?.value;
  } catch (error) {
    return ''
  }
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 构建职位信息
 */
export function buildPositionData(info: any): any {
  // const position = {
  //   title: '',          // 职位名称
  //   salary: '',         // 薪资范围
  //   salaryNumber: '',   // 薪资月数
  //   areaName: '',       // 工作地区
  //   addresses: [] as string[],      // 工作地址
  //   description: '',    // 职位描述
  //   educational: '',      // 学历要求
  //   workExperience: '',     // 工作经验
  //   labels: [] as string[],           // 职位标签
  //   benefits: [] as string[]        // 福利待遇
  // }
  //
  // Object.assign(position, {
  //   title: await execScript('window.__INITIAL_DATA__.main.positionDetail.positionName'),
  //   salaryNumber: await execScript(''),
  //   description: await execScript(''),
  //   educational: await execScript(''),
  //   workExperience: await execScript(''),
  //   labels: [await execScript('')],
  // });
  //
  // // 薪资范围和薪资月数
  // const getSalary = await execScript('document.querySelectorAll(\'.job-banner__salary\')[0].textContent');
  // if (getSalary?.result.value) {
  //   this.emitData.negotiable = getSalary?.result.value === '面议' ? '1' : '0'
  //   if (getSalary?.result.value !== '面议') {
  //     this.emitData.minSalary = this.parseSalaryRange(getSalary?.result.value.split('·')[0])?.[0];
  //     this.emitData.maxSalary = this.parseSalaryRange(getSalary?.result.value.split('·')[0])?.[1];
  //
  //     //薪资范围
  //     const salaryNumber: string = getSalary?.result.value.split('·')[1]?.split('薪')?.[0] || ''
  //     this.emitData.salaryNumber = salaryNumber ? Number(getSalary?.result.value.split('·')[1]?.split('薪')?.[0]) : 0
  //   }
  // }
  //
  //
  // // 处理区域信息和工作地址
  // if (data.data.district_list[0]?.area_cn) {
  //   position.areaName = data.data.district_list[0]?.area_cn
  // }
  //
  // if (data.data.district_list[0]?.address) {
  //   const address = (data.data.district_list[0]?.area_cn || '') + data.data.district_list[0]?.address;
  //   position.addresses = address ? [address] : [];
  // }
  //
  //
  //
  // return position;
  return ''
}

/**
 * 构建公司信息
 */
export function buildCompanyData(info: any): any {

  return {};
}
