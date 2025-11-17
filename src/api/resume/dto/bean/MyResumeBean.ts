import { ResumeModuleBean } from "./ResumeModuleBean";

export class MyResumeBean {
    /**
     * 简历UUID
     */
    uuid?: string;

    /**
     * 简历名称
     */
    name?: string;

    /**
     * 创建时间，13位毫秒级时间戳
     */
    createTime?: number;

    /**
     * 模块列表
     */
    modules?: ResumeModuleBean[];
}