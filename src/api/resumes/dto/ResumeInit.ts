import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 初始化简历创建流程请求DTO
 */
export class ResumeInitInDto extends BaseInDto {
    /**
     * 求职岗位
     */
    jobPosition: string = '';
    
    /**
     * 身份(1:职场人 2:在校/应届生)
     */
    identity: number = 0;
    
    /**
     * 上传的简历文件
     */
    file?: File;
}

/**
 * 初始化简历创建流程响应DTO
 */
export class ResumeInitOutDto extends BaseOutDto {
    /**
     * 新创建简历的草稿ID
     */
    resumeId: string = '';
}