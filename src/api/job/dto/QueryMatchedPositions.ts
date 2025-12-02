import {BaseInDto, BaseOutDto} from "@/api/BaseDto";
import {PageBean} from "@/api/job/dto/bean/PageBean";
import {MatchedPositionBean} from "@/api/job/dto/bean/MatchedPositionBean";

export class QueryMatchedPositionsInDto extends BaseInDto {
    /**
     * 关联的求职任务UUID
     */
    taskUuid: string = '';

    /**
     * 用户是否标记为"感兴趣" (1:是, 0:否)
     */
    isInterested?: number;

    /**
     * 按来源渠道筛选 (0: BOSS, 1: ZHILIAN, 2: LAGOU)
     */
    sourceChannel?: number;

    /**
     * 排序字段，可选值为 recommendedAt, matchScore
     */
    sortBy?: string;

    /**
     * 排序顺序，asc 或 desc
     */
    order?: string;

    /**
     * 分页参数
     */
    pageInfo: PageBean = new PageBean();
}

export class QueryMatchedPositionsOutDto extends BaseOutDto {
    /**
     * 总记录数
     */
    total: number = 0;

    /**
     * 数据列表
     */
    list: MatchedPositionBean[] = [];

    /**
     * 当前页码
     */
    pageNum: number = 1;

    /**
     * 每页数量
     */
    pageSize: number = 10;

    /**
     * 总页数
     */
    pages: number = 0;
}
