import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class SaveModelAccountInDto extends BaseInDto {
    /**
     * 完整的智谱AI API Key
     */
    apiKey: string = '';
}

export class SaveModelAccountOutDto extends BaseOutDto {
}