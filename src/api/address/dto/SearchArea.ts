import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { AreaBean } from "@/api/user/dto/bean/AreaBean";

export class SearchAreaInDto extends BaseInDto {
    /**
     * 范围类型 (null或不传:所有, 1:中国, 2:海外)
     */
    rangeType?: string;
    
    /**
     * 查询最深层级
     */
    maxLevel?: number;
    
    /**
     * 搜索关键词
     */
    keyWord: string = '';
}

export class SearchAreaOutDto extends BaseOutDto {
    /**
     * 地区列表
     */
    areaList: AreaBean[] = [];
}