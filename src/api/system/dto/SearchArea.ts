/**
 *[AS0002]获取全部地点
 * 生成日期：2024年3月20日 上午10:23:22
 */
import {BaseInDto, BaseOutDto} from '../../BaseDto';

export class SearchAreaInDto extends BaseInDto {

    /**
     * 范围类型（null查所有,1-中国 | 2-海外）
     * @type {string}
     */
    rangeType ?:string | null

    /**
     * 查询最深层级
     * @type {number}
     */
    maxLevel ?:number= 0

    /**
     * 关键词
     * @type {string}
     */
    keyWord ?:string= ''
}

export class SearchAreaOutDto extends BaseOutDto {

    /**
     * 地区ID
     * @type {string}
     */
    id ?:string= ''

    /**
     * 地区名称
     * @type {string}
     */
    name ?:string= ''

    /**
     * 拼音
     * @type {string}
     */
    spelling ?:string= ''

    /**
     * 父级ID
     * @type {string}
     */
    pid ?:string= ''

    /**
     * 热门标识 (1-是 | 0-否)
     * @type {string}
     */
    hotFlag ?:string= ''

    /**
     * 级别
     * @type {number}
     */
    level ?:number= 0
}
