import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { PageInfo, PageResult } from "./bean/PageInfo";
import { AiConversationOutDto } from "./bean/AiConversationOutDto";

export class QueryConversationInDto extends BaseInDto {
    /**
     * 简历UUID
     */
    resumeUuid: string = '';
    
    /**
     * 分页信息
     */
    pageInfo: PageInfo = new PageInfo();
}

export class QueryConversationOutDto extends BaseOutDto {
    /**
     * 分页结果
     */
    pageResult?: PageResult<AiConversationOutDto>;
}