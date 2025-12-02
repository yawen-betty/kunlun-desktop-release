import {cdpService, robotManager} from "@/robot/service";

/**
 * 提取单个字段
 * type:返回字段类型
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
export async function buildPositionData(info: any): Promise<any> {
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
    title: await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.positionName`),
    description: await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.description`),
    educational: await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.education`),
    workExperience: await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.workingExp`),
    labels: await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.skillLabel`),
  });

  // 薪资范围和薪资月数
  const getSalary = await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.salary`);
  if (getSalary) {
    position.salary = getSalary.split('·')[0];
    position.salaryNumber = getSalary.split('·')[1] || '';
  }

  // 处理区域信息和工作地址
  const getCity = await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.workCity`);
  const getDistrict = await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.cityDistrict`);
  position.areaName = getCity + '-' + getDistrict;

  const getAddress = await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.workAddress`);
  if (getAddress) {
    position.addresses = getAddress ? [getAddress] : [];
  }

  //福利待遇
  const getBenefits = await execScript(`__INITIAL_STATE__.jobInfo.jobDetail.detailedPosition.performanceBonus`);

  if (getBenefits) {
    position.benefits = [getBenefits];
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
    sourceChannel: 1,        // 来源渠道 (0: BOSS直聘, 1: 智联, 2: 猎聘, 3: 国聘, 4: 应届生招聘, 5: 拉钩, 0: 手动创建)
  }

  Object.assign(company, {
    companyName: await execScript(`__INITIAL_STATE__.companyName`),
    introduce: await execScript(`__INITIAL_STATE__.companyDetail.companyBase.companyDescription`),
    industry: await execScript(`__INITIAL_STATE__.companyDetail.companyBase.industryLevel`),
    size: await execScript(`__INITIAL_STATE__.companyDetail.companyBase.companySize`),
    natures: await execScript(`__INITIAL_STATE__.companyDetail.companyBase.property`),
    financingStage: await execScript(`__INITIAL_STATE__.companyDetail.companyBase.financingStageName`),
    sourceChannel: 1
  });

  const address = await execScript(`__INITIAL_STATE__.companyDetail.companyAddresses.addresses`, 'array');
  if (address && address.length > 0 ) {
    company.companyAddress = address.map((item: any) => item.address)
  }

  // 职位标签
  const getCompanyLabel = await execScript(`__INITIAL_STATE__.companyDetail.tagModule.brightSpotLabel`);

  if (getCompanyLabel && getCompanyLabel.length > 0) {
    company.companyLabel = getCompanyLabel.map((item: any) => item.value);
  }

  return company;
}
