import {Path} from "../Path";
export class SystemPath {
    /**
     * [AS0001]获取全部地点
     * @type {Path}
     */
    static QueryArea: Path = {
        url: '/fx/area/query',
        method: 'POST',
        prefix: 'system'
    }

    /**
     * [AS0002]搜索地点
     * @type {Path}
     */
    static SearchArea: Path = {
        url: '/fx/area/search',
        method: 'POST',
        prefix: 'system'
    }

    /**
     * [O0001]查询海外国家列表
     * @type {Path}
     */
    static QueryCountryList: Path = {
        url: '/fx/oversea/country/list',
        method: 'GET',
        prefix: 'system'
    }

    /**
     * [O0002]海外地区列表
     * @type {Path}
     */
    static QueryOverseaAreaList: Path = {
        url: '/fx/oversea/area/list',
        method: 'GET',
        prefix: 'system'
    }
}
