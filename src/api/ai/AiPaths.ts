import { Path } from "@/api/Path.ts";

export class AiPaths {
    /**
     * 生成简历模板
     */
    static generateTemplate: Path = {
        url: '/generate-template',
        method: 'POST',
        prefix: 'ai'
    }

    /**
     * 解析简历附件
     */
    static parseAttachment: Path = {
        url: '/parse-attachment',
        method: 'POST',
        prefix: 'ai'
    }

    /**
     * 诊断简历
     */
    static diagnose: Path = {
        url: '/diagnose',
        method: 'POST',
        prefix: 'ai'
    }

    /**
     * 撰写简历内容
     */
    static write: Path = {
        url: '/write',
        method: 'POST',
        prefix: 'ai'
    }

    /**
     * 局部内容优化
     */
    static polish: Path = {
        url: '/polish',
        method: 'POST',
        prefix: 'ai'
    }
}
