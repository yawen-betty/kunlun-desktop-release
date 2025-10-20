/**
 * 登录
 */
import { BaseInDto, BaseOutDto } from '@/api/BaseDto';

export class LoginInDto extends BaseInDto {
    /**
     * 账号
     * @type {string}
     */
    username = '';

    /**
     * 密码
     * @type {string}
     */
    password = '';
}
