import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GenerateTemplateInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
    
    /**
     * 是否上传了简历附件 0-未上传附件 1-已上传附件
     */
    hasAttachment?: string;
    
    /**
     * AI回复消息
     */
    assistantMessage: string = '';
}

export class GenerateTemplateOutDto extends BaseOutDto {
    /**
     * 简历模板JSON结构
     */
    template: any = {};
}
