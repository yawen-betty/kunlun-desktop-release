/**
 *[O0002]海外地区列表
 * 生成日期：2024年12月11日 上午10:44:02
 */
import {BaseInDto, BaseOutDto} from '../../BaseDto';

export class QueryOverseaAreaListInDto extends BaseInDto {

    /**
     * 父级id
     * @type {string}
     */
    countryId?: string = ''

    /**
     * 关键词
     * @type {string}
     */
    keyword?: string = ''

    /**
     * 州id
     * @type {string}
     */
    statesId?: string = ''

    /**
     * 是否有全部
     * @type {string}
     */
    isAll?: string = ''
}

export class QueryOverseaAreaListOutDto extends BaseOutDto {

    /**
     * 海外区域ID
     * @type {string}
     */
    id = ''

    /**
     * 区域名称
     * @type {string}
     */
    name = ''

    /**
     * 中文
     * @type {string}
     */
    zhCn = ''
}
