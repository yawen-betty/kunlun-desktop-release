import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

export class SaveModelAccountInDto extends BaseInDto {
    /**
     * 完整的智谱AI API Key
     */
    apiKey: string = '';
    
    /**
     * 模型提供商，当前固定为 "zhipu"
     */
    provider: string = '';
}

export class SaveModelAccountOutDto extends BaseOutDto {
}
