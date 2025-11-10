import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { FieldUpdateBean } from "./bean/FieldUpdateBean";

export class UpdateModuleFieldsInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';

    /**
     * 模块ID
     */
    moduleId: string = '';

    /**
     * 字段列表
     */
    fields: FieldUpdateBean[] = [];
}

export class UpdateModuleFieldsOutDto extends BaseOutDto {
}
