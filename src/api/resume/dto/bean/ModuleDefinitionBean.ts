import { FieldDefinitionBean } from "./FieldDefinitionBean";

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
