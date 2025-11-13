export class PageInfo {
    /**
     * 当前页码
     */
    pageNum: number = 0;

    /**
     * 每页数量
     */
    pageSize: number = 0;
}

export class PageResult<T> {
    /**
     * 总记录数
     */
    total?: number;

    /**
     * 当前页的数据列表
     */
    list?: T[];

    /**
     * 当前页码
     */
    pageNum?: number;

    /**
     * 每页数量
     */
    pageSize?: number;

    /**
     * 总页数
     */
    pages?: number;
}