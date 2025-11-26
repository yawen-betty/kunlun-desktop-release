import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class ActivateJobTaskInDto extends BaseInDto {
    /**
     * 求职任务的UUID
     */
    uuid: string = '';
    
    /**
     * 任务状态 (0: 运行中, 1: 未激活)
     */
    status: number = 0;
}

export class ActivateJobTaskOutDto extends BaseOutDto {
    /**
     * 操作结果
     */
    value: number = 0;
}