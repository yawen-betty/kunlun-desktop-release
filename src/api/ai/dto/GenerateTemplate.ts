import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GenerateTemplateInDto extends BaseInDto {
    /**
     * 求职岗位
     */
    jobPosition: string = '';

    /**
     * 身份 (1:职场人 2:在校/应届生)
     */
    identity: number = 0;
}

export class GenerateTemplateOutDto extends BaseOutDto {
    /**
     * 简历模板JSON结构
     */
    template: any = {};
}
