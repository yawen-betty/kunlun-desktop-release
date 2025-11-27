import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { AiMessageBean } from "./bean/AiMessageBean";

export class WriteInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
    
    /**
     * 问题ID
     */
    questionUuid?: string;
    
    /**
     * 消息列表
     */
    messages: AiMessageBean[] = [];

    /**
     * 是否追问
     */
    isFollowUp?: boolean;
}

export class WriteOutDto extends BaseOutDto {
    /**
     * AI生成的新内容及其在简历中应处的位置
     */
    generatedContent: any = {};
}
