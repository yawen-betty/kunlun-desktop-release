import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { UserInfoBean } from "@/api/auth/dto/bean/UserInfoBean";

export class WechatLoginInDto extends BaseInDto {
    /**
     * 从微信JSSDK获取的临时授权码
     * @type {string}
     */
    code: string = '';
}

export class WechatLoginOutDto extends BaseOutDto {
    /**
     * JWT令牌
     * @type {string}
     */
    token: string = '';

    /**
     * 用户信息
     * @type {UserInfoBean}
     */
    userInfo: UserInfoBean = new UserInfoBean();
}