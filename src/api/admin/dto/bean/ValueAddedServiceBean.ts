/**
 * 增值服务Bean
 */
export class ValueAddedServiceBean {
    /**
     * 增值服务ID
     */
    id: string = '';

    /**
     * 服务名称
     */
    name: string = '';

    /**
     * 服务配图URL
     */
    image?: string;

    /**
     * 服务说明
     */
    instructions?: string;

    /**
     * 服务价格
     */
    price: string = '';

    // /**
    //  * 排序
    //  */
    // sort: number = 0;
}
