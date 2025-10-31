import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { AreaInfoBean } from "@/api/user/dto/bean/AreaInfoBean";

/**
 * 查询地区请求DTO
 */
export class QueryAreaInDto extends BaseInDto {
    /**
     * 范围类型 (null或不传:所有, 1:中国, 2:海外)
     */
    rangeType?: string;
    
    /**
     * 查询最深层级
     */
    maxLevel?: number;
}

/**
 * 查询地区响应DTO
 */
export class QueryAreaOutDto extends BaseOutDto {
    /**
     * 地区列表
     */
    areaList: AreaInfoBean[] = [];
}