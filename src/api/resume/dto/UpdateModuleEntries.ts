import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { EntryUpdateBean } from "./bean/EntryUpdateBean";

export class UpdateModuleEntriesInDto extends BaseInDto {
    /**
     * 条目列表
     */
    entries?: EntryUpdateBean[];
}

export class UpdateModuleEntriesOutDto extends BaseOutDto {
}
