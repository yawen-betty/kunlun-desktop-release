import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ResumeModuleBean } from "./bean/ResumeModuleBean";

export class GetResumeDetailInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
}

export class GetResumeDetailOutDto extends BaseOutDto {
    /**
     * 简历UUID
     */
    uuid?: string;

    /**
     * 简历名称
     */
    name?: string;

    /**
     * 求职岗位
     */
    jobPosition?: string;

    /**
     * 身份(1:职场人 2:在校/应届生)
     */
    identity?: number;

    /**
     * 模块列表
     */
    modules?: ResumeModuleBean[];
}
