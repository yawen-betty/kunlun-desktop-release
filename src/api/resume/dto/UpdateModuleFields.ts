import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { FieldUpdateBean } from "./bean/FieldUpdateBean";

export class UpdateModuleFieldsInDto extends BaseInDto {
    /**
     * 字段列表
     */
    fields?: FieldUpdateBean[];
}

export class UpdateModuleFieldsOutDto extends BaseOutDto {
}
