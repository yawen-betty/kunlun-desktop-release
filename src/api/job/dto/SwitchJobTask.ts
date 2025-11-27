import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class SwitchJobTaskInDto extends BaseInDto {
}

export class SwitchJobTaskOutDto extends BaseOutDto {
    /**
     * 操作结果
     */
    value: number = 0;
}