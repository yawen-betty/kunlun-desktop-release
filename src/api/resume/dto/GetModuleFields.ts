import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { FieldDefinitionBean } from "./bean/FieldDefinitionBean";

export class GetModuleFieldsInDto extends BaseInDto {
}

export class GetModuleFieldsOutDto extends BaseOutDto {
    /**
     * 字段定义列表
     */
    fields?: FieldDefinitionBean[];
}
