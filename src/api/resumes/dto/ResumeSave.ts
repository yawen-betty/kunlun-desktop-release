import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ResumeModuleBean } from "@/api/resumes/dto/bean/ResumeModuleBean";

/**
 * 保存简历内容请求DTO
 */
export class ResumeSaveInDto extends BaseInDto {
    /**
     * 简历UUID
     */
    uuid?: string;
    
    /**
     * 模块列表
     */
    modules?: ResumeModuleBean[];
}

/**
 * 保存简历内容响应DTO
 */
export class ResumeSaveOutDto extends BaseOutDto {
    // 操作成功，返回空对象
}