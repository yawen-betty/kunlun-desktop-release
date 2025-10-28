import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { MapType } from "@/api/BaseDto";

export class GetConfigInDto extends BaseInDto {
    // 该接口无请求参数
}

export class GetConfigOutDto extends BaseOutDto {
    /**
     * 配置项映射表
     * @type {MapType<string>}
     */
    [key: string]: string;
}