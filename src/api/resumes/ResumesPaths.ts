import { Path } from "@/api/Path.ts";

/**
 * 简历相关接口路径定义
 * 包含简历初始化、保存、获取详情、模块管理等接口路径
 */
export class ResumesPaths {
    /**
     * 初始化简历创建流程
     */
    static init: Path = {
        url: '/init',
        method: 'POST',
        prefix: 'resumes'
    };

    /**
     * 保存简历内容
     */
    static save: Path = {
        url: '',
        method: 'PUT',
        prefix: 'resumes'
    };

    /**
     * 重命名简历
     */
    static rename: Path = {
        url: '/name',
        method: 'POST',
        prefix: 'resumes'
    };

    /**
     * 获取简历详情
     */
    static getDetail: Path = {
        url: '',
        method: 'GET',
        prefix: 'resumes'
    };

    /**
     * 获取所有系统模块
     */
    static getSystemModules: Path = {
        url: '/system-modules',
        method: 'GET',
        prefix: 'resumes'
    };

    /**
     * 获取系统模块字段
     */
    static getModuleFields: Path = {
        url: '/system-modules',
        method: 'GET',
        prefix: 'resumes'
    };

    /**
     * 下载简历
     */
    static download: Path = {
        url: '/download',
        method: 'GET',
        prefix: 'resumes'
    };

    /**
     * 更新简历模块
     */
    static updateModules: Path = {
        url: '/modules',
        method: 'PUT',
        prefix: 'resumes'
    };

    /**
     * 更新模块字段
     */
    static updateFields: Path = {
        url: '/fields',
        method: 'PUT',
        prefix: 'resumes'
    };

    /**
     * 更新模块条目
     */
    static updateEntries: Path = {
        url: '/entries',
        method: 'PUT',
        prefix: 'resumes'
    };
}