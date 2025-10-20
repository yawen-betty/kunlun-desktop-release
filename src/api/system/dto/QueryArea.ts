/**
 *[AS0001]获取全部地点
 * 生成日期：2024年2月26日 下午3:30:07
 */

import {BaseInDto, BaseOutDto} from "../../BaseDto";
import {AreaInfoBean} from './bean/AreaInfoBean'

export class QueryAreaInDto extends BaseInDto {

    /**
     * 范围类型（null查所有,1-中国 | 2-海外）
     * @type {String}
     */
    rangeType?: string | null;

    /**
     * 查询最深层级
     * @type {number}
     */
    maxLevel?: number;
}

export class QueryAreaOutDto extends BaseOutDto {

    /**
     * 地点标签
     * @type {Array<AreaInfoBean> = []}
     */
    areaList : Array<AreaInfoBean> = []

}
