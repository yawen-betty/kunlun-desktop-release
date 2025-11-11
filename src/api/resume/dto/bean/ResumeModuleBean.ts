import {ResumeEntryBean} from './ResumeEntryBean';

export class ResumeModuleBean {
    /**
     * 模块实例UUID
     */
    uuid?: string;

    /**
     * 模块定义UUID
     */
    moduleDefinitionUuid?: string;

    /**
     * 模块Key
     */
    moduleKey?: string;

    /**
     * 模块名称
     */
    moduleName?: string;

    /**
     * 模块排序
     */
    sortOrder?: number;

    /**
     * 经历条目列表
     */
    entries?: ResumeEntryBean[];

    /**
     * 是否为自定义 (1:是 0:否)
     */
    isCustom?: number;
}
