export class InterviewRecordBean {
    /**
     * 面试记录UUID
     */
    uuid: string = '';
    
    /**
     * 简历名称
     */
    resumeName: string = '';
    
    /**
     * 面试状态(0:未完成, 1:已完成)
     */
    interviewStatus: number = 0;
    
    /**
     * 面试得分
     */
    interviewScore: number = 0;
    
    /**
     * 面试开始时间，13位毫秒级时间戳
     */
    startTime: number = 0;
    
    /**
     * 报告是否已生成(0:否, 1:是)
     */
    reportGenerated: number = 0;
    
    /**
     * 面试报告HTML预览URL
     */
    interviewReportHtmlUrl?: string;
}
