import {BaseInDto, BaseOutDto} from '@/api/BaseDto';

/**
 * 获取简历匹配分析提示词 - 请求DTO
 */
export class GetMatchAnalysisPromptInDto extends BaseInDto {
}

/**
 * 获取简历匹配分析提示词 - 响应DTO
 */
export class GetMatchAnalysisPromptOutDto extends BaseOutDto {
    /**
     * 匹配分析提示词内容
     */
    content: string = '';
}
