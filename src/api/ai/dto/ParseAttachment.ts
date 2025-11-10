import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class ParseAttachmentInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
    
    /**
     * 上传的简历文件
     */
    file: File | null = null;
    
    /**
     * AI回复消息
     */
    assistantMessage: string = '';
}

export class ParseAttachmentOutDto extends BaseOutDto {
    /**
     * 解析出的结构化JSON数据
     */
    parsedData: any = {};
}
