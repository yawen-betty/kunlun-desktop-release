import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class InitProfileInDto extends BaseInDto {
    /**
     * 姓名
     */
    name: string = '';

    /**
     * 性别 (1:男, 2:女, 0:未知)
     */
    gender: number = 0;

    /**
     * 出生日期 (时间戳字符串)
     */
    birthDate: string = '';

    /**
     * 城市编码
     */
    city: string = '';

    /**
     * 手机号
     */
    mobile: string = '';

    /**
     * 电子邮箱
     */
    email: string = '';
}

export class InitProfileOutDto extends BaseOutDto {
    // 返回空对象
}