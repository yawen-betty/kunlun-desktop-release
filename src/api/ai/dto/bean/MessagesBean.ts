export class MessagesBean {
    /**
     * 角色类型: user-用户消息, assistant-AI回复
     */
    role?: string;

    /**
     * 消息内容
     */
    content?: string;

    /**
     * ai深度思考内容（仅role=assistant时有值）
     */
    thinking?: string;

    /**
     * 深度思考完成状态: 0-未完成, 1-已完成, 2-思考中
     */
    thinkingStatus?: string;

    /**
     * 会话时间
     */
    timestamp?: number;
}
