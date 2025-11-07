import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ModuleDefinitionBean, FieldDefinitionBean } from "@/api/resumes/dto/bean/ModuleDefinitionBean";

/**
 * 获取所有系统模块请求DTO
 */
export class SystemModuleListInDto extends BaseInDto {
    // 无请求参数
}

/**
 * 获取所有系统模块响应DTO
 */
export class SystemModuleListOutDto extends BaseOutDto {
    /**
     * 模块定义列表
     */
    modules?: ModuleDefinitionBean[];
}

/**
 * 获取系统模块字段请求DTO
 */
export class ModuleFieldsInDto extends BaseInDto {
    // 无请求参数，通过路径参数传递moduleDefinitionId
}

/**
 * 获取系统模块字段响应DTO
 */
export class ModuleFieldsOutDto extends BaseOutDto {
    /**
     * 字段定义列表
     */
    fields?: FieldDefinitionBean[];
}