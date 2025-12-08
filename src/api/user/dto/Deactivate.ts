import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 注销账号请求DTO
 */
export class DeactivateInDto extends BaseInDto {
    // 无请求参数
}

/**
 * 注销账号响应DTO
 */
export class DeactivateOutDto extends BaseOutDto {
    // 操作成功，返回空对象
}
