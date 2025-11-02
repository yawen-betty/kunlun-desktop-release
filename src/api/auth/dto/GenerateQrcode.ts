import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GenerateQrcodeInDto extends BaseInDto {
}

export class GenerateQrcodeOutDto extends BaseOutDto {
    /**
     * 状态标识，用于后续轮询获取token
     */
    state: string = '';
    
    /**
     * 微信授权链接
     */
    authUrl: string = '';
}