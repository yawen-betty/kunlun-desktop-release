import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class SaveModelAccountInDto extends BaseInDto {
    /**
     * API密钥
     */
    apiKey: string = '';
}

export class SaveModelAccountOutDto extends BaseOutDto {
}