import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetConfigInDto extends BaseInDto {
}

export class GetConfigOutDto extends BaseOutDto {
    /**
     * 配置ID
     */
    id: number = 0;

    /**
     * 应用名称
     */
    appName: string = '';

    /**
     * 应用图标URL
     */
    appIcon: string = '';

    /**
     * 中文应用标语
     */
    appChineseSlogan: string = '';

    /**
     * 登录页图片URL
     */
    loginPageImage: string = '';

    /**
     * 英文应用标语
     */
    appEnglishSlogan: string = '';

    /**
     * 登录页图片文件名
     */
    loginPageImageFileName: string = '';

    /**
     * 应用图标文件名
     */
    appIconFileName: string = '';
}