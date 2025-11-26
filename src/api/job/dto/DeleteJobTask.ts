import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class DeleteJobTaskInDto extends BaseInDto {
    /**
     * 求职任务的UUID
     */
    uuid: string = '';
}

export class DeleteJobTaskOutDto extends BaseOutDto {
    /**
     * 操作结果
     */
    value: number = 0;
}