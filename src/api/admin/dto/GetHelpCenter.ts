import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

/**
 * 获取帮助中心内容 - 请求DTO
 */
export class GetHelpCenterInDto extends BaseInDto {
}

/**
 * 获取帮助中心内容 - 响应DTO
 */
export class GetHelpCenterOutDto extends BaseOutDto {
    /**
     * 帮助中心的HTML或Markdown内容
     */
    content: string = '';
}
