import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { QuestionBean } from "@/api/ai/dto/bean/QuestionBean";
import { AiMessageBean } from "./bean/AiMessageBean";

export class DiagnoseInDto extends BaseInDto {
    /**
     * 简历ID
     */
    resumeId: string = '';
    
    /**
     * 消息列表
     */
    messages: AiMessageBean[] = [];
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
