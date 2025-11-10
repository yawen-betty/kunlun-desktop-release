import {ResumePaths} from '@/api/resume/ResumePaths';
import HttpClient from '@/api/HttpClient';
import {inject} from 'vue';
import {InitResumeInDto, InitResumeOutDto} from '@/api/resume/dto/InitResume';
import {SaveResumeInDto, SaveResumeOutDto} from '@/api/resume/dto/SaveResume';
import {RenameResumeInDto, RenameResumeOutDto} from '@/api/resume/dto/RenameResume';
import {GetResumeDetailInDto, GetResumeDetailOutDto} from '@/api/resume/dto/GetResumeDetail';
import {DownloadResumeInDto, DownloadResumeOutDto} from '@/api/resume/dto/DownloadResume';
import {UpdateModulesInDto, UpdateModulesOutDto} from '@/api/resume/dto/UpdateModules';
import {GetSystemModulesInDto, GetSystemModulesOutDto} from '@/api/resume/dto/GetSystemModules';
import {GetModuleFieldsInDto, GetModuleFieldsOutDto} from '@/api/resume/dto/GetModuleFields';
import {UpdateModuleFieldsInDto, UpdateModuleFieldsOutDto} from '@/api/resume/dto/UpdateModuleFields';
import {UpdateModuleEntriesInDto, UpdateModuleEntriesOutDto} from '@/api/resume/dto/UpdateModuleEntries';
import {Result} from '@/api/BaseDto';
import {EmptyOutDto} from '@/api/HttpClient';

export class ResumeService {
    private static instance: ResumeService;
    private http: HttpClient;

    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    public static getInstance(): ResumeService {
        if (!ResumeService.instance) {
            ResumeService.instance = new ResumeService();
        }
        return ResumeService.instance;
    }

    // /**
    //  * 初始化简历创建流程
    //  */
    // public async initResume(params: InitResumeInDto): Promise<Result<InitResumeOutDto>> {
    //     console.log(1)
    //     return await this.http.uploadFormData<Result<InitResumeOutDto>>(ResumePaths.initResume, params);
    // }

    /**
     * 保存简历内容
     */
    public async saveResume(resumeId: string, params: SaveResumeInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.saveResume,
            url: ResumePaths.saveResume.url.replace('{resumeId}', resumeId)
        };
        return await this.http.request<EmptyOutDto>(path, params);
    }

    /**
     * 重命名简历
     */
    public async renameResume(resumeId: string, params: RenameResumeInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.renameResume,
            url: ResumePaths.renameResume.url.replace('{resumeId}', resumeId)
        };
        return await this.http.request<EmptyOutDto>(path, params);
    }

    /**
     * 获取简历详情
     */
    public async getResumeDetail(resumeId: string, params: GetResumeDetailInDto): Promise<Result<GetResumeDetailOutDto>> {
        const path = {
            ...ResumePaths.getResumeDetail,
            url: ResumePaths.getResumeDetail.url.replace('{resumeId}', resumeId)
        };
        return await this.http.request<Result<GetResumeDetailOutDto>>(path, params);
    }

    /**
     * 下载简历
     */
    public async downloadResume(resumeId: string, format: string, style: string, watermark?: string): Promise<Blob> {
        const queryParams = new URLSearchParams({ format, style });
        if (watermark) {
            queryParams.append('watermark', watermark);
        }
        const path = {
            ...ResumePaths.downloadResume,
            url: ResumePaths.downloadResume.url.replace('{resumeId}', resumeId) + '?' + queryParams.toString()
        };
        return await this.http.request<Blob>(path, new DownloadResumeInDto());
    }

    /**
     * 更新简历模块
     */
    public async updateModules(resumeId: string, params: UpdateModulesInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.updateModules,
            url: ResumePaths.updateModules.url.replace('{resumeId}', resumeId)
        };
        return await this.http.request<EmptyOutDto>(path, params);
    }

    /**
     * 获取所有系统模块
     */
    public async getSystemModules(params: GetSystemModulesInDto): Promise<Result<GetSystemModulesOutDto>> {
        return await this.http.request<Result<GetSystemModulesOutDto>>(ResumePaths.getSystemModules, params);
    }

    /**
     * 获取系统模块字段
     */
    public async getModuleFields(moduleDefinitionId: string, params: GetModuleFieldsInDto): Promise<Result<GetModuleFieldsOutDto>> {
        const path = {
            ...ResumePaths.getModuleFields,
            url: ResumePaths.getModuleFields.url.replace('{moduleDefinitionId}', moduleDefinitionId)
        };
        return await this.http.request<Result<GetModuleFieldsOutDto>>(path, params);
    }

    /**
     * 更新模块字段
     */
    public async updateModuleFields(resumeId: string, moduleId: string, params: UpdateModuleFieldsInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.updateModuleFields,
            url: ResumePaths.updateModuleFields.url.replace('{resumeId}', resumeId).replace('{moduleId}', moduleId)
        };
        return await this.http.request<EmptyOutDto>(path, params);
    }

    /**
     * 更新模块条目
     */
    public async updateModuleEntries(resumeId: string, moduleId: string, params: UpdateModuleEntriesInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.updateModuleEntries,
            url: ResumePaths.updateModuleEntries.url.replace('{resumeId}', resumeId).replace('{moduleId}', moduleId)
        };
        return await this.http.request<EmptyOutDto>(path, params);
    }
}
