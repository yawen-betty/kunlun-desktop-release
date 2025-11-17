import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class RenameResumeInDto extends BaseInDto {
    /**
     * 新的简历名称
     */
    name: string = '';
}

export class RenameResumeOutDto extends BaseOutDto {
}
