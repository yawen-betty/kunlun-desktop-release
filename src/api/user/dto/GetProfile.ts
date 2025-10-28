import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetProfileInDto extends BaseInDto {
}

export class GetProfileOutDto extends BaseOutDto {
    /**
     * 用户姓名
     */
    name: string = '';

    /**
     * 性别 (1:男, 2:女)
     */
    gender: number = 0;

    /**
     * 出生日期 (时间戳)
     */
    birthDate: string = '';

    /**
     * 城市
     */
    city: string = '';

    /**
     * 手机号
     */
    mobile: string = '';

    /**
     * 邮箱
     */
    email: string = '';

    /**
     * 头像URL
     */
    avatarUrl: string = '';
}