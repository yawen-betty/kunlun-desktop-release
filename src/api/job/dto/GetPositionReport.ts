import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { RelatedDimensionAnalysisBean } from "@/api/job/dto/bean/RelatedDimensionAnalysisBean";

export class GetPositionReportInDto extends BaseInDto {
}

export class GetPositionReportOutDto extends BaseOutDto {
    /**
     * 匹配职位的主键UUID
     */
    uuid: string = '';
    
    /**
     * 职位UUID
     */
    positionUuid: string = '';
    
    /**
     * 推荐时间 (时间戳)
     */
    recommendedAt: number = 0;
    
    /**
     * 匹配度 (0-100)
     */
    matchScore: number = 0;
    
    /**
     * AI生成的总结建议
     */
    aiSummary: string = '';
    
    /**
     * AI生成的详细分析报告
     */
    aiReport: RelatedDimensionAnalysisBean[] = [];
    
    /**
     * 用户是否标记为"感兴趣" (1:是, 0:否)
     */
    isInterested: number = 0;
}
