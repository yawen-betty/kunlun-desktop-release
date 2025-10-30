import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { AreaBean } from "@/api/user/dto/bean/AreaBean";

export class GetProfileInDto extends BaseInDto {
    // 无参数
}

export class GetProfileOutDto extends BaseOutDto {
    /**
     * 微信 Union ID
     */
    unionId: string = '';

    /**
     * 微信 Open ID
     */
    openId: string = '';

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
     * 城市地区详细信息
     */
    areaBean: AreaBean = new AreaBean();

    /**
     * 手机号
     */
    mobile: string = '';

    /**
     * 电子邮箱
     */
    email: string = '';

    /**
     * 头像URL
     */
    avatarUrl?: string;

    /**
     * 个人资料是否补全 (1:是, 0:否)
     */
    profileCompleteFlag: string = '';
}