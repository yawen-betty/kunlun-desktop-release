import { BaseInDto } from "@/api/BaseDto";

export class InitProfileInDto extends BaseInDto {
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
}