import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class CopyResumeInDto extends BaseInDto {
    /**
     * 要复制的简历ID
     */
    resumeId: string = '';
}

export class CopyResumeOutDto extends BaseOutDto {
    /**
     * 新简历ID
     */
    resumeId: string = '';

    /**
     * 新简历名称
     */
    resumeName: string = '';
}