import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { MyResumeBean } from "./bean/MyResumeBean";

export class GetMyResumeListInDto extends BaseInDto {
}

export class GetMyResumeListOutDto extends BaseOutDto {
    /**
     * 简历列表
     */
    resumes?: MyResumeBean[];
}