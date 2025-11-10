import { ResumeFieldBean } from './ResumeFieldBean';

export class ResumeEntryBean {
    /**
     * 经历条目UUID
     */
    entryUuid?: string;

    /**
     * 经历条目排序
     */
    entrySortOrder?: number;

    /**
     * 字段列表
     */
    fields?: ResumeFieldBean[];
}
