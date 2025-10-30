import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetModelAccountInDto extends BaseInDto {
    // 无参数
}

export class GetModelAccountOutDto extends BaseOutDto {
    /**
     * 模型提供商，当前固定为 "zhipu"
     */
    provider: string = '';

    /**
     * 部分打码的API Key
     */
    apiKey: string = '';
}