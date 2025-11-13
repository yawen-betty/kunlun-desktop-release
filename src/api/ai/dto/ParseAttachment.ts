import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { AiMessageBean } from "./bean/AiMessageBean";

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
     * 消息列表
     */
    messages: AiMessageBean[] = [];
}

export class ParseAttachmentOutDto extends BaseOutDto {
    /**
     * 解析出的结构化JSON数据
     */
    parsedData: any = {};
}
