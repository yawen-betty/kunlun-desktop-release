import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 获取模型账号配置请求DTO
 */
export class GetModelAccountInDto extends BaseInDto {
    /**
     * 模型类型（1-智谱AI）
     */
    modelType: string = '';
}

/**
 * 获取模型账号配置响应DTO
 */
export class GetModelAccountOutDto extends BaseOutDto {
    /**
     * 模型类型（1-智谱AI）
     */
    modelType: string = '';
    
    /**
     * API Key，如果未配置则为null
     */
    apiKey?: string;
}