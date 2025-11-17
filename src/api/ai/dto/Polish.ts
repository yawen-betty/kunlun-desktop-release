import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class PolishInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
    
    /**
     * 需要优化的原文
     */
    text: string = '';
    
    /**
     * 需要优化的字段名
     */
    fieldName: string = '';
    
    /**
     * 最大优化长度
     */
    maxLength: number = 0;

    /**
     * 优化模式（1-润色 2-扩展 3-简化 4-总结）
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
