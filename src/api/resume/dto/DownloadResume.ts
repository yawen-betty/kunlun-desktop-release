import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class DownloadResumeInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';

    /**
     * 下载格式
     */
    format: string = '';

    /**
     * 简历风格
     */
    style: string = '';

    /**
     * 水印内容
     */
    watermark?: string;
}

export class DownloadResumeOutDto extends BaseOutDto {
}
