import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

export class SaveConversationInDto extends BaseInDto {
    /**
     * 简历UUID
     */
    resumeUuid: string = '';

    /**
     * 会话类型(1-简历模版 2-简历解析 ... 12-面试题生成)
     */
    type: string = '';

    /**
     * 角色类型(user-用户消息, assistant-AI回复)
     */
    role: string = '';

    /**
     * 消息内容
     */
    content: string = '';

    /**
     * AI深度思考内容(仅role=assistant时有值)
     */
    thinking?: string;

    /**
     * 深度思考完成状态: 0-未完成, 1-已完成, 2-思考中
     */
    thinkingStatus?: string;
}

export class SaveConversationOutDto extends BaseOutDto {
}
