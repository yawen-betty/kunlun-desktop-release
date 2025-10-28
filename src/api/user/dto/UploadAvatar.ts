import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class UploadAvatarInDto extends BaseInDto {
    /**
     * 头像文件
     */
    file: File | null = null;
}

export class UploadAvatarOutDto extends BaseOutDto {
    /**
     * 新头像的URL
     */
    avatarUrl: string = '';
}