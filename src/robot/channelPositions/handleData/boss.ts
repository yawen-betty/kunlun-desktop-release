import {cdpService, robotManager} from "@/robot/service";

/**
 * 提取单个字段
 * 返回字段类型
 */
async function execScript(s: string, type?:string): Promise<any> {
  await robotManager.sleep(1000);
  try {
    const result = await cdpService.executeScript(s);
    return result.result?.value;
  } catch (error) {
    return type === 'array' ? [] : '';
  }
}

/**
 * 构建职位信息
 */
export async function buildPositionData(data: any): Promise<any> {
  const position = {
    title: '',          // 职位名称
    salary: '',         // 薪资范围
    salaryNumber: '',   // 薪资月数
    areaName: '',       // 工作地区
    addresses: [] as string[],      // 工作地址
    description: '',    // 职位描述
    educational: '',      // 学历要求
    workExperience: '',     // 工作经验
    labels: [] as string[],           // 职位标签
    benefits: [] as string[]        // 福利待遇
  }

  Object.assign(position, {
    title: await execScript(`_jobInfo.job_name`),
    areaName: await execScript(`document.querySelector(".text-city").textContent`),
    description: await execScript(`document.querySelector(".job-sec-text").textContent`),
    educational: await execScript(`document.querySelector(".text-degree").textContent`),
    workExperience: await execScript(`document.querySelector(".text-experiece").textContent`),
    labels: await execScript(`[...document.querySelectorAll(".job-keyword-list li")].map(li => li.textContent.trim())`),
    benefits: await execScript(`[...document.querySelectorAll(".detail-box > .tag-container-new > .job-tags span")].map(span => span.textContent.trim())`)
  });

  // 薪资范围和薪资月数
  const getSalary = await execScript(`_jobInfo.job_salary`);
  if (getSalary) {
    position.salary = getSalary.split('·')[0];
    position.salaryNumber = getSalary.split('·')[1] || '';
  }

  // 处理工作地址
  const getAddress = await execScript(`document.querySelector(".location-address").textContent`);
  if (getAddress) {
    position.addresses = getAddress ? [getAddress] : [];
  }

  return position;
}

/**
 * 构建公司信息
 */
export async function buildCompanyData(info: any): Promise<any> {
  const company = {
    companyName: '',      // 公司名称
    introduce: '',        // 公司简介
    industry: '',         // 公司行业
    size: '',             // 公司规模
    natures: '',          // 公司性质
    financingStage: '',   // 融资阶段
    companyAddress: [] as string[], // 公司地址
    companyLabel: [] as string[],   // 公司标签
    sourceChannel: 0,        // 来源渠道 (0: BOSS直聘, 1: 智联, 2: 猎聘, 3: 国聘, 4: 应届生招聘, 5: 拉钩, 0: 手动创建)
  }

  Object.assign(company, {
    companyName: await execScript(`document.querySelector(".name").childNodes[0].textContent.trim()`),
    introduce: await execScript(`document.querySelector(".fold-text").textContent`),
    industry: await execScript(`document.querySelector(".industry-link").textContent`),
    size: await execScript(`document.querySelector(".info p").childNodes[2].textContent.trim()`),
    financingStage: await execScript(`document.querySelector(".info p").childNodes[0].textContent.trim()`),
    companyLabel:  await execScript(`[...document.querySelectorAll(".company-talents-list li")].map(li => li.textContent.trim())`),
    companyAddress:  await execScript(`[...document.querySelectorAll(".location-address")].map(a => a.textContent.trim())`),
    sourceChannel: 0
  });

  const address = await execScript(`__INITIAL_STATE__.companyDetail.companyAddresses.addresses`, 'array');
  if (address && address.length > 0 ) {
    company.companyAddress = address.map((item: any) => item.address)
  }

  return company;
}
