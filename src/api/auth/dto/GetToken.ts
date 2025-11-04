import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetTokenInDto extends BaseInDto {
    /**
     * 与微信登录回调时一致的唯一状态标识符
     */
    state: string = '';
}

export class GetTokenOutDto extends BaseOutDto {
    /**
     * 用于后续接口的身份认证
     */
    token: string = '';
}