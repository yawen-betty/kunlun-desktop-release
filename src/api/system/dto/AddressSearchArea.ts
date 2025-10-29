import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class AddressSearchAreaBean {
    /**
     * 地区ID
     */
    id: string = '';

    /**
     * 地区名称
     */
    name: string = '';

    /**
     * 拼音
     */
    spelling: string = '';

    /**
     * 父级ID
     */
    pid: string = '';

    /**
     * 热门标识 (1-是 | 0-否)
     */
    hotFlag: string = '';

    /**
     * 级别
     */
    level: number = 0;
}

export class AddressSearchAreaInDto extends BaseInDto {
    /**
     * 范围类型（null查所有, 1-中国, 2-海外）
     */
    rangeType?: string;

    /**
     * 查询最深层级
     */
    maxLevel: number = 0;

    /**
     * 关键词
     */
    keyWord: string = '';
}

export class AddressSearchAreaOutDto extends BaseOutDto {
    /**
     * 搜索结果列表
     */
    list: AddressSearchAreaBean[] = [];
}