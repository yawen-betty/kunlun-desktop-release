/**
 * 模块定义Bean
 * 用于封装模块定义信息，包含模块UUID、Key、名称等
 */
export class ModuleDefinitionBean {
    /**
     * 模块定义UUID
     */
    uuid?: string;
    
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
     * 字段定义列表
     */
    fields?: FieldDefinitionBean[];
}

/**
 * 字段定义Bean
 * 用于封装字段定义信息，包含字段UUID、Key、名称等
 */
export class FieldDefinitionBean {
    /**
     * 字段定义UUID
     */
    uuid?: string;
    
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
    sortOrder?: number;
}