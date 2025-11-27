/**
 * 反馈Bean
 */
export class FeedbackBean {
    /**
     * 问题标题
     */
    title: string = '';

    /**
     * 问题内容
     */
    problem: string = '';

    /**
     * 回复状态 (0未回复 1已回复)
     */
    status: string = '';

    /**
     * 问题附带的截图URL
     */
    problemImages?: string[];

    /**
     * 回复 (管理员)
     */
    reply: string = '';

    /**
     * 回复截图
     */
    replyImages: string[] = [];

    /**
     * 回复时间 (ISO 8601格式)
     */
    replyTime: string = '';
}
