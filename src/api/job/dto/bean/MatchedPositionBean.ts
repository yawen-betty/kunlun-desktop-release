export class MatchedPositionBean {
    /**
     * 职位UUID
     */
    positionUuid: string = '';
    
    /**
     * 关联的求职任务UUID
     */
    taskUuid: string = '';
    
    /**
     * 职位名称
     */
    title: string = '';
    
    /**
     * 薪资范围
     */
    salary: string = '';
    
    /**
     * 薪资数
     */
    salaryNumber: string = '';
    
    /**
     * 职位标签
     */
    labels: string[] = [];
    
    /**
     * 公司名称
     */
    companyName: string = '';
    
    /**
     * 职位地址
     */
    areaName: string = '';
    
    /**
     * 匹配度 (0-100)
     */
    matchScore: number = 0;
    
    /**
     * 推荐时间 (时间戳)
     */
    recommendedAt: number = 0;
    
    /**
     * 工作经验
     */
    workExperience: string = '';
    
    /**
     * 学历要求
     */
    educational: string = '';
    
    /**
     * 用户是否标记为"感兴趣" (1:是, 0:否)
     */
    isInterested: number = 0;
    
    /**
     * 来源渠道 (0: BOSS直聘, 1: 智联校园, 2: 猎聘, 3: 国聘, 4: 应届生招聘, 5: 拉钩, 0: 手动创建)
     */
    sourceChannel: number = 0;
    
    /**
     * 职位详情地址
     */
    jobDetailUrl: string = '';
}
