import { Path } from "@/api/Path.ts";

/**
 * AI相关接口路径定义
 * 包含AI生成简历模板等接口路径
 */
export class AiPaths {
    /**
     * 生成简历模板
     */
    static generateTemplate: Path = {
        url: '/generate-template',
        method: 'POST',
        prefix: 'ai'
    };
}