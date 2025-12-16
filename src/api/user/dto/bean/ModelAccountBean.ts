/**
 * 模型账号Bean
 * 用于封装AI模型账号信息
 */
export class ModelAccountBean {
    /**
     * 模型类型（1-智谱AI）
     */
    modelType?: string;
    
    /**
     * API Key，如果未配置则为null
     */
    apiKey?: string;
}
