import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetPositionDetailInDto extends BaseInDto {
}

export class GetPositionDetailOutDto extends BaseOutDto {
    /**
     * 匹配职位主键uuid
     */
    uuid: string = '';
    
    /**
     * 职位uuid
     */
    positionUuid: string = '';
    
    /**
     * 职位名称
     */
    title: string = '';
    
    /**
     * 公司名称
     */
    companyName: string = '';
    
    /**
     * 学历 (0:学历不限 1:大专 2:本科 3:硕士 4:博士及以上)
     */
    educational: string = '';
    
    /**
     * 工作经验 (1:在校/应届生 2:1年以下 3:1-3年 4:3-5年 5:5-10年 6:10年以上)
     */
    workExperience: string = '';
    
    /**
     * 职位标签
     */
    labels: string[] = [];
    
    /**
     * 工作地址
     */
    areaName: string = '';
    
    /**
     * 详细地址
     */
    addresses: string[] = [];
    
    /**
     * 职位描述
     */
    description: string = '';
    
    /**
     * 福利待遇
     */
    benefits: string[] = [];
    
    /**
     * 职位来源 (0: BOSS直聘, 1: 智联校园, 2: 猎聘, 3: 国聘, 4: 应届生招聘, 5: 拉钩, 0: 手动创建)
     */
    sourceChannel: number = 0;
    
    /**
     * 薪资范围
     */
    salary: string = '';
    
    /**
     * 薪资数
     */
    salaryNumber: number = 0;
    
    /**
     * 推荐时间 (时间戳)
     */
    recommendedAt: number = 0;
    
    /**
     * 用户是否标记为"感兴趣" (1:是, 0:否)
     */
    isInterested: number = 0;
}
