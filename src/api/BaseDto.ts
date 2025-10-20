export class PageInfo {
    /**
     * 页码
     * @type {number}
     */
    pageNum = 0;

    /**
     * 每页条目数
     * @type {number}
     */
    pageSize = 0;
}

export abstract class BaseInDto {
    // eslint-disable-next-line no-undef
    [key: string]: any;

    // pageInfo?: PageInfo = new PageInfo()
}

export abstract class BaseOutDto {
    // 兼容map的情况
    // eslint-disable-next-line no-undef
    [key: string]: any;
}

// 对象类型
export interface Result<T extends BaseOutDto> {
    code: number;

    errCode?: string;

    msg: string;

    data: T;
}

// map类型
export type MapType<T> = {
    [key: string]: T;
};

export interface ResultMap<T> {
    code: number;

    errCode: string;

    msg: string;

    data: MapType<T>;
}

// 数组类型
export abstract class BaseOutListDto<S extends BaseOutDto> {
    list: Array<S> = [];
    total = 0;
    totalRow?: number;
}

export interface ResultList<T extends BaseOutListDto<BaseOutDto>> {
    code: number;

    msg: string;

    data: T;
}

export type ObjMap = {
    [key: string]: any;
};
