import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { EntryUpdateBean } from "./bean/EntryUpdateBean";

export class UpdateModuleEntriesInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';

    /**
     * 模块ID
     */
    moduleId: string = '';

    /**
     * 条目列表
     */
    entries: EntryUpdateBean[] = [];
}

export class UpdateModuleEntriesOutDto extends BaseOutDto {
}
