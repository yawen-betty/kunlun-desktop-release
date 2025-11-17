import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 保存模型账号配置请求DTO
 */
export class SaveModelAccountInDto extends BaseInDto {
    /**
     * 模型类型（1-智谱AI）
     */
    modelType: string = '';
    
    /**
     * 完整的智谱AI API Key
     */
    apiKey: string = '';
}

/**
 * 保存模型账号配置响应DTO
 */
export class SaveModelAccountOutDto extends BaseOutDto {
    // 操作成功，返回空对象
}