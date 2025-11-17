import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ModuleUpdateBean } from "./bean/ModuleUpdateBean";

export class UpdateModulesInDto extends BaseInDto {
    /**
     * 模块列表
     */
    modules?: ModuleUpdateBean[];
}

export class UpdateModulesOutDto extends BaseOutDto {
}
