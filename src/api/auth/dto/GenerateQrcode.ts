import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 生成微信扫码登录二维码请求DTO
 */
export class GenerateQrcodeInDto extends BaseInDto {
    // 无请求参数
}

/**
 * 生成微信扫码登录二维码响应DTO
 */
export class GenerateQrcodeOutDto extends BaseOutDto {
    /**
     * 状态标识，用于后续轮询获取token
     */
    state: string = '';
    
    /**
     * 微信授权链接
     */
    authUrl: string = '';
    
    /**
     * 二维码图片Base64编码
     */
    qrcodeImage: string = '';
}