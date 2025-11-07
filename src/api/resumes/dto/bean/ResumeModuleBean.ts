/**
 * 简历模块Bean
 * 用于封装简历模块信息，包含模块定义、排序、条目等
 */
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
}

/**
 * 简历条目Bean
 * 用于封装简历条目信息，包含条目UUID、排序、字段等
 */
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

/**
 * 简历字段Bean
 * 用于封装简历字段信息，包含字段定义、排序、值等
 */
export class ResumeFieldBean {
    /**
     * 字段实例UUID
     */
    uuid?: string;
    
    /**
     * 字段定义UUID
     */
    fieldDefinitionUuid?: string;
    
    /**
     * 字段Key
     */
    fieldKey?: string;
    
    /**
     * 字段名称
     */
    fieldName?: string;
    
    /**
     * 字段排序
     */
    fieldSortOrder?: number;
    
    /**
     * 字段值
     */
    fieldValue?: string;
}