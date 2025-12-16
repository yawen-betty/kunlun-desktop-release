import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class WechatCallbackInDto extends BaseInDto {
    /**
     * 微信授权成功后返回的临时授权码
     */
    code: string = '';
    
    /**
     * 用于保持请求和回调之间状态的唯一标识符
     */
    state: string = '';
}

export class WechatCallbackOutDto extends BaseOutDto {
}