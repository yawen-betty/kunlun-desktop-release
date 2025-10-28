import {Path} from "../Path";

export class SystemPath {
    /**
     * 查询地区 (API设计文档)
     */
    static AddressQueryArea: Path = {
        url: '/area',
        method: 'POST',
        prefix: 'address'
    }

    /**
     * 搜索地区 (API设计文档)
     */
    static AddressSearchArea: Path = {
        url: '/search',
        method: 'POST',
        prefix: 'address'
    }
}
