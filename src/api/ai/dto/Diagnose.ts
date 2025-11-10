import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { QuestionBean } from "@/api/ai/dto/bean/QuestionBean";

export class DiagnoseInDto extends BaseInDto {
    /**
     * 当前简历的完整JSON对象
     */
    resumeContent: any = {};
}

export class DiagnoseOutDto extends BaseOutDto {
    /**
     * 当前简历分数
     */
    score: number = 0;

    /**
     * 建议优化的提问列表
     */
    questions: QuestionBean[] = [];
}
