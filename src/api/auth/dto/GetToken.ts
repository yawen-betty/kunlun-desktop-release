import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 获取登录Token请求DTO
 */
export class GetTokenInDto extends BaseInDto {
    /**
     * 与微信登录回调时一致的唯一状态标识符
     */
    state: string = '';
}

/**
 * 获取登录Token响应DTO
 */
export class GetTokenOutDto extends BaseOutDto {
    /**
     * 用于后续接口的身份认证
     */
    token: string = '';
}