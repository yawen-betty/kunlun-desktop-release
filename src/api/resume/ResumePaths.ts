import { Path } from "@/api/Path.ts";

export class ResumePaths {
    /**
     * 初始化简历创建流程
     */
    static initResume: Path = {
        url: '/init',
        method: 'POST',
        prefix: 'resumes'
    }

    /**
     * 获取我的简历列表
     */
    static getMyResumeList: Path = {
        url: '/my-list',
        method: 'GET',
        prefix: 'resumes'
    }

    /**
     * 保存简历内容
     */
    static saveResume: Path = {
        url: '/{resumeId}',
        method: 'PUT',
        prefix: 'resumes'
    }

    /**
     * 重命名简历
     */
    static renameResume: Path = {
        url: '/{resumeId}/name',
        method: 'POST',
        prefix: 'resumes'
    }

    /**
     * 获取简历详情
     */
    static getResumeDetail: Path = {
        url: '/{resumeId}',
        method: 'GET',
        prefix: 'resumes'
    }

    /**
     * 下载简历
     */
    static downloadResume: Path = {
        url: '/{resumeId}/download',
        method: 'GET',
        prefix: 'resumes'
    }

    /**
     * 更新简历模块
     */
    static updateModules: Path = {
        url: '/{resumeId}/modules',
        method: 'PUT',
        prefix: 'resumes'
    }

    /**
     * 获取所有系统模块
     */
    static getSystemModules: Path = {
        url: '/system-modules',
        method: 'GET',
        prefix: 'resumes'
    }

    /**
     * 获取系统模块字段
     */
    static getModuleFields: Path = {
        url: '/system-modules/{moduleDefinitionId}/fields',
        method: 'GET',
        prefix: 'resumes'
    }

    /**
     * 更新模块字段
     */
    static updateModuleFields: Path = {
        url: '/{resumeId}/modules/{moduleId}/fields',
        method: 'PUT',
        prefix: 'resumes'
    }

    /**
     * 更新模块条目
     */
    static updateModuleEntries: Path = {
        url: '/{resumeId}/modules/{moduleId}/entries',
        method: 'PUT',
        prefix: 'resumes'
    }

    /**
     * 删除简历
     */
    static deleteResume: Path = {
        url: '/{resumeId}',
        method: 'DELETE',
        prefix: 'resumes'
    }

    /**
     * 复制简历
     */
    static copyResume: Path = {
        url: '/{resumeId}/copy',
        method: 'POST',
        prefix: 'resumes'
    }
}
