import {RelatedDimensionAnalysisBean} from './RelatedDimensionAnalysisBean';

/**
 * 匹配信息Bean
 */
export class MatchInfoBean {
    /**
     * 匹配分数
     */
    jobPositionMatchScore: string = '';

    /**
     * 匹配建议
     */
    summaryAndSuggestion: string = '';

    /**
     * 匹配维度集合
     */
    relatedDimensionAnalysisList: RelatedDimensionAnalysisBean[] = [];
}
