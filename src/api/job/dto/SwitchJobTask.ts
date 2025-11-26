import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class SwitchJobTaskInDto extends BaseInDto {
    /**
     * 需要激活的求职任务的UUID
     */
    uuid: string = '';
}

export class SwitchJobTaskOutDto extends BaseOutDto {
    /**
     * 操作结果
     */
    value: number = 0;
}