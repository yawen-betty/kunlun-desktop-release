import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetProfileInDto extends BaseInDto {
    // 该接口无请求参数
}

export class GetProfileOutDto extends BaseOutDto {
    /**
     * 用户姓名
     * @type {string}
     */
    name: string = '';

    /**
     * 性别 (1:男, 2:女)
     * @type {number}
     */
    gender: number = 0;

    /**
     * 出生日期
     * @type {string}
     */
    birthDate: string = '';

    /**
     * 城市
     * @type {string}
     */
    city: string = '';

    /**
     * 手机号码
     * @type {string}
     */
    mobile: string = '';

    /**
     * 邮箱
     * @type {string}
     */
    email: string = '';

    /**
     * 头像URL
     * @type {string}
     */
    avatarUrl: string = '';
}