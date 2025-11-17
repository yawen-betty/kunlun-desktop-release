import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ModuleDefinitionBean } from "./bean/ModuleDefinitionBean";

export class GetSystemModulesInDto extends BaseInDto {
}

export class GetSystemModulesOutDto extends BaseOutDto {
    /**
     * 模块定义列表
     */
    modules?: ModuleDefinitionBean[];
}
