import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

export class GetConfigInDto extends BaseInDto {
    // 无参数
}

export class GetConfigOutDto extends BaseOutDto {
    /**
     * 微信appId
     */
    appId: string = '';

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
     * 登录页背景图URL
     */
    loginPageImage: string = '';

    /**
     * 英文应用标语
     */
    appEnglishSlogan: string = '';

    /**
     * 登录页背景图文件名
     */
    loginPageImageFileName: string = '';

    /**
     * 应用图标文件名
     */
    appIconFileName: string = '';
    
    /**
     * 微信应用ID
     */
    appId: string = '';
}
