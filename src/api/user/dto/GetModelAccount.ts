import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

export class GetModelAccountInDto extends BaseInDto {
    /**
     * 模型类型（1-智谱AI）
     */
    modelType: string = '';
}

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
