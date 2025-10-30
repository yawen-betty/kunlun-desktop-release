import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class UploadInDto extends BaseInDto {
    /**
     * 要上传的文件对象
     */
    file: File | null = null;

    /**
     * 文件存储的文件夹路径，默认为 kunlun-pc/user-avatar
     */
    folderPath?: string;
}

export class UploadOutDto extends BaseOutDto {
    /**
     * 文件服务器域名
     */
    fileHost: string = '';

    /**
     * 文件相对路径
     */
    filePath: string = '';

    /**
     * 原始文件名
     */
    originalFilename: string = '';
}