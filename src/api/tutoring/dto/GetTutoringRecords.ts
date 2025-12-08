import {BaseInDto, BaseOutDto} from "@/api/BaseDto";
import {PageInfoBean} from "@/api/tutoring/dto/bean/PageInfoBean";
import {TutoringRecordBean} from "@/api/tutoring/dto/bean/TutoringRecordBean";

export class GetTutoringRecordsInDto extends BaseInDto {
    /**
     * 分页信息
     */
    pageInfo: PageInfoBean = new PageInfoBean();
}

export class GetTutoringRecordsOutDto extends BaseOutDto {
    /**
     * 辅导记录列表
     */
    list: TutoringRecordBean[] = [];

    /**
     * 总记录数
     */
    total: number = 0;

    /**
     * 当前页码
     */
    pageNum: number = 1;

    /**
     * 每页数量
     */
    pageSize: number = 20;

    /**
     * 总页数
     */
    pages: number = 0;
}
