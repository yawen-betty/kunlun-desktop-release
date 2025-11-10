import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class PolishInDto extends BaseInDto {
    /**
     * 需要优化的原文
     */
    text: string = '';

    /**
     * 优化模式（"polish", "expand", "simplify"）
     */
    mode: string = '';

    /**
     * 用户的额外要求
     */
    requirement?: string;
}

export class PolishOutDto extends BaseOutDto {
    /**
     * 优化后的文本
     */
    polishedText: string = '';
}
