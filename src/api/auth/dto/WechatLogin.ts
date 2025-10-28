import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { UserInfoBean } from "@/api/auth/dto/bean/UserInfoBean";

export class WechatLoginInDto extends BaseInDto {
    /**
     * 从微信JSSDK获取的临时授权码
     */
    code: string = '';
}

export class WechatLoginOutDto extends BaseOutDto {
    /**
     * JWT令牌
     */
    token: string = '';

    /**
     * 用户信息
     */
    userInfo: UserInfoBean = new UserInfoBean();
}