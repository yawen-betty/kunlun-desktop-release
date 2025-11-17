import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 退出登录请求DTO
 */
export class LogoutInDto extends BaseInDto {
    // 无请求参数
}

/**
 * 退出登录响应DTO
 */
export class LogoutOutDto extends BaseOutDto {
    // 操作成功，返回空对象
}