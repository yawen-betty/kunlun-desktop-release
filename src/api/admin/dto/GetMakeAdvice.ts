import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

/**
 * 预约咨询 - 请求DTO
 */
export class GetMakeAdviceInDto extends BaseInDto {
    /**
     * 增值服务的唯一标识
     */
    uuid: string = '';
}

/**
 * 预约咨询 - 响应DTO
 */
export class GetMakeAdviceOutDto extends BaseOutDto {
}
