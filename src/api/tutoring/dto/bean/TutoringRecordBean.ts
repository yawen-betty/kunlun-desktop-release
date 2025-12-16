export class TutoringRecordBean {
    /**
     * 辅导记录UUID
     */
    uuid: string = '';
    
    /**
     * 简历名称
     */
    resumeName: string = '';
    
    /**
     * 辅导开始时间，13位毫秒级时间戳
     */
    startTime: number = 0;
    
    /**
     * HTML预览URL
     */
    htmlUrl?: string;
}
