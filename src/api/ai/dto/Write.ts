import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class WriteInDto extends BaseInDto {
    /**
     * 当前简历的上下文
     */
    resumeContext: any = {};

    /**
     * 当前的对话历史
     */
    conversation: any[] = [];

    /**
     * 用户的最新回答
     */
    userResponse: string = '';
}

export class WriteOutDto extends BaseOutDto {
    /**
     * AI生成的新内容及其在简历中应处的位置
     */
    generatedContent: any = {};
}
