import { Path } from "@/api/Path.ts";

/**
 * 地址相关接口路径定义
 * 包含地区查询、地区搜索等接口路径
 */
export class AddressPaths {
    /**
     * 查询地区
     */
    static queryArea: Path = {
        url: '/area',
        method: 'POST',
        prefix: 'address'
    };

    /**
     * 搜索地区
     */
    static searchArea: Path = {
        url: '/search',
        method: 'POST',
        prefix: 'address'
    };
}