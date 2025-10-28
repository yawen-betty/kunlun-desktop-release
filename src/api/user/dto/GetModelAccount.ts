import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetModelAccountInDto extends BaseInDto {
}

export class GetModelAccountOutDto extends BaseOutDto {
    /**
     * 提供商
     */
    provider: string = '';

    /**
     * API密钥 (部分打码)
     */
    apiKey: string = '';
}