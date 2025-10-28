import { BaseInDto } from "@/api/BaseDto";

export class SaveModelAccountInDto extends BaseInDto {
    /**
     * 智谱AI API Key
     * @type {string}
     */
    apiKey: string = '';
}