import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ResumeModuleBean } from "./bean/ResumeModuleBean";

export class SaveResumeInDto extends BaseInDto {
    /**
     * 模块列表
     */
    modules?: ResumeModuleBean[];
}

export class SaveResumeOutDto extends BaseOutDto {
}
