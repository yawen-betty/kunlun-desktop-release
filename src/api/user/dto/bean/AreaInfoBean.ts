/**
 * 地区信息Bean
 * 用于封装地区相关信息，包含地区ID、名称、拼音等
 */
export class AreaInfoBean {
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
     * 子地区列表 (递归结构)
     */
    children?: AreaInfoBean[];
}