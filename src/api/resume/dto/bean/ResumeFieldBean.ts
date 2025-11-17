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

    /**
     * 是否为自定义 (1:是 0:否)
     */
    isCustom?: number;

    /**
     * 字段字符限制大小 (0表示无限制)
     */
    maxLength?: number;
}
