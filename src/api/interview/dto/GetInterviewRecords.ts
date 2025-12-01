import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { PageInfoBean } from "@/api/tutoring/dto/bean/PageInfoBean";
import { InterviewRecordBean } from "@/api/interview/dto/bean/InterviewRecordBean";

export class GetInterviewRecordsInDto extends BaseInDto {
    /**
     * 分页信息
     */
    pageInfo: PageInfoBean = new PageInfoBean();
}

export class GetInterviewRecordsOutDto extends BaseOutDto {
    /**
     * 面试记录列表
     */
    list: InterviewRecordBean[] = [];
    
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
