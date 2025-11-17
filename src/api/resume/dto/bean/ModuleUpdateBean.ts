export class ModuleUpdateBean {
    /**
     * 模块实例UUID (更新或排序现有模块时使用)
     */
    uuid?: string;

    /**
     * 模块定义UUID (新增系统模块时使用)
     */
    moduleDefinitionUuid?: string;

    /**
     * 模块名称 (新增自定义模块时使用)
     */
    moduleName?: string;

    /**
     * 模块排序
     */
    sortOrder: number = 0;
}
