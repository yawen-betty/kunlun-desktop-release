import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetAiRegisterGuideInDto extends BaseInDto {
    /**
     * 模型类型（1-智谱AI）
     */
    modelType: string = '';
}

export class GetAiRegisterGuideOutDto extends BaseOutDto {
    /**
     * AI名字
     */
    aiName: string = '';
    
    /**
     * 注册引导内容
     */
    content: string = '';
    
    /**
     * 模型类型（1-智谱AI）
     */
    modelType: string = '';
}