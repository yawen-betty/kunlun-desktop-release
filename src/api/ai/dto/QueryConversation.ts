import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { MessagesBean } from "./bean/MessagesBean";

export class QueryConversationInDto extends BaseInDto {
    /**
     * 简历UUID
     */
    resumeUuid: string = '';
    
    /**
     * 跳过条数(分页起始位置)
     */
    skip: number = 0;
    
    /**
     * 查询条数(每页数量)
     */
    limit: number = 0;
}

export class QueryConversationOutDto extends BaseOutDto {
    /**
     * 简历UUID
     */
    resumeUuid?: string;
    
    /**
     * 会话类型
     */
    type?: string;
    
    /**
     * 消息列表
     */
    messages?: MessagesBean[];
}