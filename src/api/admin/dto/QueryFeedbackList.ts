import {BaseInDto, BaseOutDto} from "@/api/BaseDto";
import {FeedbackBean} from "@/api/admin/dto/bean/FeedbackBean";
import {PageInfoBean} from "@/api/admin/dto/bean/PageInfoBean";

/**
 * 获取反馈的回复列表 - 请求DTO
 */
export class QueryFeedbackListInDto extends BaseInDto {
    /**
     * 分页信息
     */
    pageInfo: PageInfoBean = new PageInfoBean();
}

/**
 * 获取反馈的回复列表 - 响应DTO
 */
export class QueryFeedbackListOutDto extends BaseOutDto {
    /**
     * 反馈列表
     */
    list: FeedbackBean[] = [];
}
