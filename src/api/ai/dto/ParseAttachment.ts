import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class ParseAttachmentInDto extends BaseInDto {
    /**
     * 上传的简历文件
     */
    attachmentFile: File | null = null;
}

export class ParseAttachmentOutDto extends BaseOutDto {
    /**
     * 解析出的结构化JSON数据
     */
    parsedData: any = {};
}
