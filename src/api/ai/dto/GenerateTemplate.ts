import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

/**
 * 生成简历模板请求DTO
 */
export class AiGenerateTemplateInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
}

/**
 * 生成简历模板响应DTO
 * 注意：此接口返回SseEmitter流式响应
 */
export class AiGenerateTemplateOutDto extends BaseOutDto {
    // SseEmitter流式响应，返回生成的模板内容
}