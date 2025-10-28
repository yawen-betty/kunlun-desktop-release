import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetModelAccountInDto extends BaseInDto {
    // 该接口无请求参数
}

export class GetModelAccountOutDto extends BaseOutDto {
    /**
     * 服务提供商
     * @type {string}
     */
    provider: string = '';

    /**
     * API Key（部分打码显示）
     * @type {string}
     */
    apiKey: string = '';
}