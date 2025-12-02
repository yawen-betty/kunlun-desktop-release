import {BaseInDto, BaseOutDto} from '@/api/BaseDto';

export class GetVersionInfoInDto extends BaseInDto {
    /**
     * 平台类型（1Android，2ios，3mac，4windows）- 放在请求头
     */
    type?: string;

    /**
     * 版本号 - 放在请求头
     */
    version?: string;
}

export class GetVersionInfoOutDto extends BaseOutDto {
    /**
     * 主键
     */
    id: string = '';

    /**
     * 用途（1正式，2提审）
     */
    purpose: string = '';

    /**
     * 状态（0.未发布1.已发布）
     */
    status: string = '';

    /**
     * 版本号
     */
    versionNum: string = '';

    /**
     * 平台类型（1Android，2ios，3mac，4windows）
     */
    type: string = '';

    /**
     * 是否强制更新（0.不强制1.强制更新）
     */
    isForcedUpdate: string = '';

    /**
     * 版本内容
     */
    content: string = '';

    /**
     * 发布时间
     */
    releaseTime: string = '';

    /**
     * 是否最新版本（0.不是最新版本1.是最新版本）
     */
    isLatestVersion: string = '';
}
