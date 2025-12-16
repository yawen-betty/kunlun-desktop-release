import {BaseInDto, BaseOutDto} from "@/api/BaseDto";
import {AreaInfoBean} from "@/api/user/dto/bean/AreaInfoBean";

/**
 * 补全基本信息请求DTO
 */
export class InitProfileInDto extends BaseInDto {
    /**
     * 姓名
     */
    name: string = '';

    /**
     * 性别 (0:未知, 1:男, 2:女)
     */
    gender: number;

    /**
     * 出生日期 (时间戳)
     */
    birthDate: number;

    /**
     * 地点Bean列表
     */
    areaInfoBeanList?: AreaInfoBean[] = [];

    /**
     * 手机号
     */
    mobile: string = '';

    /**
     * 电子邮箱
     */
    email: string = '';
}

/**
 * 补全基本信息响应DTO
 */
export class InitProfileOutDto extends BaseOutDto {
    // 操作成功，返回空对象
}
