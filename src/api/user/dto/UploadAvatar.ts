import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class UploadAvatarInDto extends BaseInDto {
    // 该接口使用multipart/form-data上传文件，不需要额外的请求体参数
}

export class UploadAvatarOutDto extends BaseOutDto {
    /**
     * 新头像的URL
     * @type {string}
     */
    avatarUrl: string = '';
}