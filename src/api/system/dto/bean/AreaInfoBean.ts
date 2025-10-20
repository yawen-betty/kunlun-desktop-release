/**
 * AutoGenerate生成的Ts代码
 * 生成日期：2024年2月29日 上午9:27:54
 */

export class AreaInfoBean {

    /**
     * 地区ID
     * @type {string}
     */
    id?: string = ''

    /**
     * 地区名称
     * @type {string}
     */
    name?: string = ''

    /**
     * 拼音
     * @type {string}
     */
    spelling?: string = ''

    /**
     * 父级ID
     * @type {string}
     */
    pid?: string = ''

    /**
     * 热门标识 (1-是 | 0-否)
     * @type {string}
     */
    hotFlag?: string = ''

    /**
     * 级别
     * @type {number}
     */
    level?: number = 0

    /**
     * 子集
     * @type {Array<AreaInfoBean> = []}
     */
    children?: Array<AreaInfoBean> = []

    /**
     * 汉化名称
     * @type {string}
     */
    zhCn?: string = ''

    /**
     * 英文名
     * @type {string}
     */
    enUs?: string = ''


    /**
     * 州名称
     * @type {string}
     */
    statesName?: string = ''

    /**
     * 州汉化名
     * @type {string}
     */
    statesZhCh?: string = ''
}
