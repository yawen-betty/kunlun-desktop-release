import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class WechatLoginInDto extends BaseInDto {
    /**
     * 从微信JSSDK获取的临时授权码
     */
    code: string = '';
}

export class WechatLoginOutDto extends BaseOutDto {
    /**
     * JWT，用于后续接口的身份认证
     */
    token: string = '';
}