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

    /**
     * 上传的简历文件
     */
    file?: File;
}

export class InitResumeOutDto extends BaseOutDto {
    /**
     * 新创建简历的草稿ID
     */
    resumeId: string = '';
}
