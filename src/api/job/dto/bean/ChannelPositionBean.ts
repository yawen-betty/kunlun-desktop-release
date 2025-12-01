export class ChannelPositionBean {
    /**
     * 在源站的唯一ID
     */
    sourceId: string = '';

    /**
     * 职位名称
     */
    title: string = '';

    /**
     * 薪资范围
     */
    salary?: string;

    /**
     * 区域信息
     */
    areaName?: string;

    /**
     * 详细工作地址列表
     */
    addresses?: string[];

    /**
     * 职位描述
     */
    description?: string;

    /**
     * 学历要求 (0:学历不限 1:大专 2:本科 3:硕士 4:博士及以上)
     */
    educational?: string;

    /**
     * 工作经验 (1:在校/应届生 2:1年以下 3:1-3年 4:3-5年 5:5-10年 6:10年以上)
     */
    workExperience?: string;

    /**
     * 职位标签
     */
    labels?: string[];

    /**
     * 福利待遇
     */
    benefits?: string[];

    /**
     * 薪资数 (单位:元)
     */
    salaryNumber?: number;

    /**
     * 公司名称
     */
    companyName: string = '';
    
    /**
     * 公司简介
     */
    introduce: string = '';
    
    /**
     * 公司地址
     */
    companyAddress?: string[];

    /**
     * 公司行业
     */
    industry?: string;
    
    /**
     * 公司标签
     */
    companyLabel?: string[];

    /**
     * 公司规模
     */
    size?: string;

    /**
     * 公司性质
     */
    natures?: string;

    /**
     * 融资阶段
     */
    financingStage?: string;

    /**
     * 上架状态 (1:上架, 0:下架)，默认为1
     */
    publishStatus?: number;

    /**
     * 来源渠道 (0: BOSS直聘, 1: 智联校园, 2: 猎聘, 3: 国聘, 4: 应届生招聘, 5: 拉钩,)
     */
    sourceChannel: number = 0;

    /**
     * 职位详情URL
     */
    jobDetailUrl: string = '';

    /**
     * 发布日期 (时间戳)
     */
    publishDate?: number;
}
