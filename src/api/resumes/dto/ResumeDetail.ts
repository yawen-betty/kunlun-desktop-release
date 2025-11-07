import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ResumeModuleBean } from "@/api/resumes/dto/bean/ResumeModuleBean";

/**
 * 获取简历详情请求DTO
 */
export class ResumeDetailInDto extends BaseInDto {
    // 无请求参数，通过路径参数传递resumeId
}

/**
 * 获取简历详情响应DTO
 */
export class ResumeDetailOutDto extends BaseOutDto {
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