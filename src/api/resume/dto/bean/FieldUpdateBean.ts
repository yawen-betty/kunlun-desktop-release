export class FieldUpdateBean {
    /**
     * 字段实例UUID (更新或排序现有字段时使用)
     */
    uuid?: string;

    /**
     * 字段定义UUID (新增系统字段时使用)
     */
    fieldDefinitionUuid?: string;

    /**
     * 字段名称 (新增自定义字段时使用)
     */
    fieldName?: string;

    /**
     * 字段排序
     */
    sortOrder: number = 0;
}
