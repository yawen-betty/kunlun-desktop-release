export class AreaBean {
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
     * 热门标识 (1:是, 0:否)
     */
    hotFlag: string = '';

    /**
     * 级别
     */
    level: number = 0;

    /**
     * 子地区列表
     */
    children?: AreaBean[];
}