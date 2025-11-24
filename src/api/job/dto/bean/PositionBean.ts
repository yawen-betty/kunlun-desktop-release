export class PositionBean {
    /**
     * 职位UUID
     */
    uuid: string = '';
    
    /**
     * 职位名称
     */
    title: string = '';
    
    /**
     * 薪资范围
     */
    salary: string = '';
    
    /**
     * 区域信息
     */
    areaName: string = '';
    
    /**
     * 详细工作地址列表
     */
    addresses: string[] = [];
    
    /**
     * 职位描述
     */
    description: string = '';
    
    /**
     * 学历要求 (0:学历不限 1:大专 2:本科 3:硕士 4:博士及以上)
     */
    educational: string = '';
    
    /**
     * 工作经验 (0:经验不限 1:在校 2:应届)
     */
    workExperience: string = '';
    
    /**
     * 职位标签
     */
    labels: string[] = [];
    
    /**
     * 福利待遇
     */
    benefits: string[] = [];
    
    /**
     * 公司UUID
     */
    companyId: string = '';
    
    /**
     * 公司名称
     */
    companyName: string = '';
    
    /**
     * 公司行业
     */
    industry: string = '';
    
    /**
     * 公司规模
     */
    size: string = '';
    
    /**
     * 公司性质
     */
    natures: string = '';
    
    /**
     * 融资阶段
     */
    financingStage: string = '';
    
    /**
     * 上架状态 (1:上架, 0:下架)
     */
    status: number = 1;
    
    /**
     * 来源渠道 (0: BOSS直聘, 1: 智联校园, 2: 猎聘, 3: 国聘, 4: 应届生招聘, 5: 拉钩, 0: 手动创建)
     */
    sourceChannel: number = 0;
    
    /**
     * 匹配度 (0-100)
     */
    matchScore: number = 0;
    
    /**
     * AI生成的总结建议
     */
    aiSummary: string = '';
    
    /**
     * 用户是否标记为"感兴趣"
     */
    isInterested: boolean = false;
    
    /**
     * 推荐时间
     */
    recommendedAt: string = '';
}