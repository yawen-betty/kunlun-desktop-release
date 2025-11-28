import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

/**
 * 获取帮助中心状态 - 请求DTO
 */
export class GetHelpCenterStatusInDto extends BaseInDto {
}

/**
 * 获取帮助中心状态 - 响应DTO
 */
export class GetHelpCenterStatusOutDto extends BaseOutDto {
    /**
     * 状态(0启用 1停用)
     */
    status: string = '';
}
