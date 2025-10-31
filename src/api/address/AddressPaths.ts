import { Path } from "@/api/Path.ts";

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