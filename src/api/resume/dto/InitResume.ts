import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class InitResumeInDto extends BaseInDto {
    /**
     * 求职岗位
     */
    jobPosition: string = '';

    /**
     * 身份 (1:职场人 2:在校/应届生)
     */
    identity: number = 0;
}

export class InitResumeOutDto extends BaseOutDto {
    /**
     * 新创建简历的ID
     */
    resumeId?: string;

    /**
     * 新创建简历的名称
     */
    resumeName?: string;
}
