import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetDefaultJobTaskInDto extends BaseInDto {
}

export class GetDefaultJobTaskOutDto extends BaseOutDto {
    /**
     * 主键
     */
    uuid: string = '';
    
    /**
     * 任务名称
     */
    taskName: string = '';
    
    /**
     * 求职岗位
     */
    jobTitle: string = '';
    
    /**
     * 期望城市区域代码
     */
    cityCode: string = '';
    
    /**
     * 期望城市名称
     */
    cityName: string = '';
    
    /**
     * 工作经验
     */
    experience: string = '';
    
    /**
     * 关联的简历UUID
     */
    resumeUuid: string = '';
    
    /**
     * 任务状态 (0: 运行中, 1: 未激活, 2: 已归档)
     */
    status: number = 0;
    
    /**
     * 是否为默认任务
     */
    isDefault: boolean = false;
}