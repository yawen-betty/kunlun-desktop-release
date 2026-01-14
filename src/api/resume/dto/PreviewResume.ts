import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class PreviewResumeInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';

    /**
     * 模板ID
     */
    templateId: string = '';
}

export class PreviewResumeOutDto extends BaseOutDto {
    /**
     * PDF文件地址
     */
    pdfUrl?: string;

    /**
     * 图片预览地址
     */
    imageUrl?: string;
}
