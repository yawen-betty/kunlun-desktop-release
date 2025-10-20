/**
 *[O0001]查询海外国家列表
 * 生成日期：2024年12月11日 上午10:44:02
 */
import {BaseInDto, BaseOutDto} from '../../BaseDto';


export class QueryCountryListInDto extends BaseInDto {

    /**
     * 关键词
     * @type {string}
     */
    keyword ?: string= ''
}

export class QueryCountryListOutDto extends BaseOutDto {

    /**
     * 国家ID
     * @type {string}
     */
    id = ''

    /**
     * 国家名称
     * @type {string}
     */
    name = ''

    /**
     * 中文
     * @type {string}
     */
    zhCn = ''

}
