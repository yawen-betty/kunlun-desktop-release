import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class DownloadTutoringPdfInDto extends BaseInDto {
}

export class DownloadTutoringPdfOutDto extends BaseOutDto {
    /**
     * PDF文件地址
     */
    pdfUrl: string = '';
}
