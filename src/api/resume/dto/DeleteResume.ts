import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class DeleteResumeInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
}

export class DeleteResumeOutDto extends BaseOutDto {
}