import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { AreaInfoBean } from "@/api/user/dto/bean/AreaInfoBean";

/**
 * 更新当前用户信息请求DTO
 */
export class UpdateProfileInDto extends BaseInDto {
    /**
     * 姓名
     */
    name?: string;
    
    /**
     * 性别 (0:未知, 1:男, 2:女)
     */
    gender?: number;
    
    /**
     * 出生日期
     */
    birthDate?: number;
    
    /**
     * 地点Bean列表
     */
    areaInfoBeanList?: AreaInfoBean[];
    
    /**
     * 手机号
     */
    mobile?: string;
    
    /**
     * 电子邮箱
     */
    email?: string;
    
    /**
     * 头像URL (通过文件上传接口获取)
     */
    avatarUrl?: string;
}

/**
 * 更新当前用户信息响应DTO
 */
export class UpdateProfileOutDto extends BaseOutDto {
    /**
     * 用户ID
     */
    uuid: string = '';
    
    /**
     * 用户姓名
     */
    name?: string;
    
    /**
     * 性别 (0:未知, 1:男, 2:女)
     */
    gender?: number;
    
    /**
     * 出生年月
     */
    birthDate?: number;
    
    /**
     * 地点Bean列表
     */
    areaInfoBeanList?: AreaInfoBean[];
    
    /**
     * 手机号码
     */
    mobile?: string;
    
    /**
     * 个人邮箱
     */
    email?: string;
    
    /**
     * 头像链接
     */
    avatarUrl?: string;
    
    /**
     * 个人信息是否已补全 (0:否, 1:是)
     */
    profileCompleteFlag: string = '';
}