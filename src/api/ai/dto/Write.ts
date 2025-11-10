import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class WriteInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
    
    /**
     * 提问问题话术
     */
    question: string = '';
    
    /**
     * 用户回答内容
     */
    userResponse: string = '';
    
    /**
     * AI回复消息
     */
    assistantMessage: string = '';
}

export class WriteOutDto extends BaseOutDto {
    /**
     * AI生成的新内容及其在简历中应处的位置
     */
    generatedContent: any = {};
}
