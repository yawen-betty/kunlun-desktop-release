import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 微信登录请求DTO
 */
export class WechatLoginInDto extends BaseInDto {
    /**
     * 从微信JSSDK获取的临时授权码
     */
    code: string = '';
}

/**
 * 微信登录响应DTO
 */
export class WechatLoginOutDto extends BaseOutDto {
    /**
     * JWT，用于后续接口的身份认证
     */
    token: string = '';
}