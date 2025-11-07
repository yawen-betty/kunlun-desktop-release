import { ResumesPaths } from '@/api/resumes/ResumesPaths';
import HttpClient from '@/api/HttpClient';
import { inject } from 'vue';
import { ResumeInitInDto, ResumeInitOutDto } from '@/api/resumes/dto/ResumeInit';
import { ResumeSaveInDto, ResumeSaveOutDto } from '@/api/resumes/dto/ResumeSave';
import { ResumeDetailInDto, ResumeDetailOutDto } from '@/api/resumes/dto/ResumeDetail';
import { SystemModuleListInDto, SystemModuleListOutDto, ModuleFieldsInDto, ModuleFieldsOutDto } from '@/api/resumes/dto/SystemModules';
import { Result } from '@/api/BaseDto';
import { EmptyOutDto } from '@/api/HttpClient';

export class ResumeService {
    private http: HttpClient;
    private static instance: ResumeService;
    
    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    public static getInstance(): ResumeService {
        if (!ResumeService.instance) {
            ResumeService.instance = new ResumeService();
        }
        return ResumeService.instance;
    }
    
    /**
     * 初始化简历创建流程
     */
    public async initResume(params: ResumeInitInDto): Promise<Result<ResumeInitOutDto>> {
        return await this.http.request<Result<ResumeInitOutDto>>(ResumesPaths.init, params);
    }
    
    /**
     * 保存简历内容
     */
    public async saveResume(resumeId: string, params: ResumeSaveInDto): Promise<EmptyOutDto> {
        const path = { ...ResumesPaths.save, url: `/${resumeId}` };
        return await this.http.request<EmptyOutDto>(path, params);
    }
    
    /**
     * 重命名简历
     */
    public async renameResume(resumeId: string, params: { name: string }): Promise<EmptyOutDto> {
        const path = { ...ResumesPaths.rename, url: `/${resumeId}/name` };
        return await this.http.request<EmptyOutDto>(path, params);
    }
    
    /**
     * 获取简历详情
     */
    public async getResumeDetail(resumeId: string): Promise<Result<ResumeDetailOutDto>> {
        const path = { ...ResumesPaths.getDetail, url: `/${resumeId}` };
        return await this.http.request<Result<ResumeDetailOutDto>>(path, {});
    }
    
    /**
     * 获取所有系统模块
     */
    public async getSystemModules(): Promise<Result<SystemModuleListOutDto>> {
        return await this.http.request<Result<SystemModuleListOutDto>>(ResumesPaths.getSystemModules, {});
    }
    
    /**
     * 获取系统模块字段
     */
    public async getModuleFields(moduleDefinitionId: string): Promise<Result<ModuleFieldsOutDto>> {
        const path = { ...ResumesPaths.getModuleFields, url: `/system-modules/${moduleDefinitionId}/fields` };
        return await this.http.request<Result<ModuleFieldsOutDto>>(path, {});
    }
    
    /**
     * 下载简历
     */
    public async downloadResume(resumeId: string, params: { format: string; style: string; watermark?: string }): Promise<Blob> {
        const path = { ...ResumesPaths.download, url: `/${resumeId}/download` };
        return await this.http.request<Blob>(path, params);
    }
}