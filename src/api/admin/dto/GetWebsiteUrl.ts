import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

/**
 * 获取官网地址 - 请求DTO
 */
export class GetWebsiteUrlInDto extends BaseInDto {
}

/**
 * 获取官网地址 - 响应DTO
 */
export class GetWebsiteUrlOutDto extends BaseOutDto {
    /**
     * 官网的URL地址
     */
    websiteUrl: string = '';
}
