import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ResumeModuleBean } from "./bean/ResumeModuleBean";

export class GetResumeModulesInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
}

export class GetResumeModulesOutDto extends BaseOutDto {
    /**
     * 模块列表
     */
    modules?: ResumeModuleBean[];
}
