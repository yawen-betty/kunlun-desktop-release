import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

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

export class SaveModelAccountOutDto extends BaseOutDto {
}
