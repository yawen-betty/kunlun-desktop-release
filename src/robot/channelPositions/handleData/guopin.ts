/**
 * 构建职位信息
 */
export function buildPositionData(data: any): any {
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
    title: data.data.job_name,
    salary: parseSalary(data.data.min_wage, data.data.wage_unit_cn) + '-' + parseSalary(data.data.max_wage, data.data.wage_unit_cn),
    salaryNumber: data.data.months ? data.data.months + '薪' : '',
    description: data.data.contents,
    educational: data.data.education_cn,
    workExperience: data.data.experience_cn,
    labels: [data.data.category_cn].concat(data.data?.job_custom_tags_cn || []),
  });
  // 处理区域信息和工作地址
  if (data.data.district_list[0]?.area_cn) {
    position.areaName = data.data.district_list[0]?.area_cn
  }

  if (data.data.district_list[0]?.address) {
    const address = (data.data.district_list[0]?.area_cn || '') + data.data.district_list[0]?.address;
    position.addresses = address ? [address] : [];

  }

  return position;
}
// 薪资转换
function parseSalary(num: number, type: string) {
  if (num === 0 || type === '元/月') return num / 1000;

  if (type === '元/天') return (num * 20) / 1000;

  if (type === '元/时') return (num * 160) / 1000;
}

/**
 * 构建公司信息
 */
export function buildCompanyData(data: any): any {
  const company = {
    companyName: '',      // 公司名称
    introduce: '',        // 公司简介
    industry: '',         // 公司行业
    size: '',             // 公司规模
    natures: '',          // 公司性质
    financingStage: '',   // 融资阶段
    companyAddress: [] as string[], // 公司地址
    companyLabel: [] as string[],   // 公司标签
    sourceChannel: 3,        // 来源渠道 (0: BOSS直聘, 1: 智联校园, 2: 猎聘, 3: 国聘, 4: 应届生招聘, 5: 拉钩, 0: 手动创建)
  }

  Object.assign(company, {
    companyName: data.data.company_info.name,
    introduce: data.data.company_info.introduction,
    industry: data.data.company_info.industry_cn,
    size: data.data.company_info.scale_cn,
    natures: data.data.company_info.nature_cn,
    financingStage: data.data.company_info.financing_stage_cn,
    sourceChannel: 3
  });

  const address = (data.data.company_info.area_cn || '') + (data.data.company_info?.address || '')
  company.companyAddress = address ? [address] : []

  return company;
}
