import {ResumePaths} from '@/api/resume/ResumePaths';
import HttpClient from '@/api/HttpClient';
import {inject} from 'vue';
import {InitResumeInDto, InitResumeOutDto} from '@/api/resume/dto/InitResume';
import {GetMyResumeListInDto, GetMyResumeListOutDto} from '@/api/resume/dto/GetMyResumeList';
import {SaveResumeInDto} from '@/api/resume/dto/SaveResume';
import {RenameResumeInDto} from '@/api/resume/dto/RenameResume';
import {GetResumeDetailInDto, GetResumeDetailOutDto} from '@/api/resume/dto/GetResumeDetail';
import {DownloadResumeInDto, DownloadResumeOutDto} from '@/api/resume/dto/DownloadResume';
import {UpdateModulesInDto} from '@/api/resume/dto/UpdateModules';
import {GetSystemModulesInDto, GetSystemModulesOutDto} from '@/api/resume/dto/GetSystemModules';
import {GetModuleFieldsInDto, GetModuleFieldsOutDto} from '@/api/resume/dto/GetModuleFields';
import {UpdateModuleFieldsInDto} from '@/api/resume/dto/UpdateModuleFields';
import {UpdateModuleEntriesInDto} from '@/api/resume/dto/UpdateModuleEntries';
import {DeleteResumeInDto, DeleteResumeOutDto} from '@/api/resume/dto/DeleteResume';
import {CopyResumeInDto, CopyResumeOutDto} from '@/api/resume/dto/CopyResume';
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

    /**
     * 初始化简历创建流程
     */
    public async initResume(params: InitResumeInDto): Promise<Result<InitResumeOutDto>> {
        return await this.http.request<Result<InitResumeOutDto>>(ResumePaths.initResume, params);
    }

    /**
     * 获取我的简历列表
     */
    public async getMyResumeList(params: GetMyResumeListInDto): Promise<Result<GetMyResumeListOutDto>> {
        return await this.http.request<Result<GetMyResumeListOutDto>>(ResumePaths.getMyResumeList, params);
    }

    /**
     * 保存简历内容
     */
    public async saveResume(params: SaveResumeInDto, showLoading: boolean = false): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.saveResume,
            url: ResumePaths.saveResume.url.replace('{resumeId}', params.resumeId)
        };
        return await this.http.request<EmptyOutDto>(path, params, {showLoading});
    }

    /**
     * 重命名简历
     */
    public async renameResume(params: RenameResumeInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.renameResume,
            url: ResumePaths.renameResume.url.replace('{resumeId}', params.resumeId)
        };
        return await this.http.request<EmptyOutDto>(path, params);
    }

    /**
     * 获取简历详情
     */
    public async getResumeDetail(params: GetResumeDetailInDto): Promise<Result<GetResumeDetailOutDto>> {
        const path = {
            ...ResumePaths.getResumeDetail,
            url: ResumePaths.getResumeDetail.url.replace('{resumeId}', params.resumeId)
        };
        return await this.http.request<Result<GetResumeDetailOutDto>>(path, params);
    }

    /**
     * 下载简历
     */
    public async downloadResume(params: DownloadResumeInDto): Promise<Result<DownloadResumeOutDto>> {
        const path = {
            ...ResumePaths.downloadResume,
            url: ResumePaths.downloadResume.url.replace('{resumeId}', params.resumeId)
        };
        return await this.http.request<Result<DownloadResumeOutDto>>(path, params);
    }

    /**
     * 更新简历模块
     */
    public async updateModules(params: UpdateModulesInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.updateModules,
            url: ResumePaths.updateModules.url.replace('{resumeId}', params.resumeId)
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
    public async getModuleFields(params: GetModuleFieldsInDto): Promise<Result<GetModuleFieldsOutDto>> {
        const path = {
            ...ResumePaths.getModuleFields,
            url: ResumePaths.getModuleFields.url.replace('{moduleDefinitionId}', params.moduleDefinitionId)
        };
        return await this.http.request<Result<GetModuleFieldsOutDto>>(path, params);
    }

    /**
     * 更新模块字段
     */
    public async updateModuleFields(params: UpdateModuleFieldsInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.updateModuleFields,
            url: ResumePaths.updateModuleFields.url.replace('{resumeId}', params.resumeId).replace('{moduleId}', params.moduleId)
        };
        return await this.http.request<EmptyOutDto>(path, params);
    }

    /**
     * 更新模块条目
     */
    public async updateModuleEntries(params: UpdateModuleEntriesInDto): Promise<EmptyOutDto> {
        const path = {
            ...ResumePaths.updateModuleEntries,
            url: ResumePaths.updateModuleEntries.url.replace('{resumeId}', params.resumeId).replace('{moduleId}', params.moduleId)
        };
        return await this.http.request<EmptyOutDto>(path, params);
    }

    /**
     * 删除简历
     */
    public async deleteResume(params: DeleteResumeInDto): Promise<Result<DeleteResumeOutDto>> {
        const path = {
            ...ResumePaths.deleteResume,
            url: ResumePaths.deleteResume.url.replace('{resumeId}', params.resumeId)
        };
        return await this.http.request<Result<DeleteResumeOutDto>>(path, params);
    }

    /**
     * 复制简历
     */
    public async copyResume(params: CopyResumeInDto): Promise<Result<CopyResumeOutDto>> {
        const path = {
            ...ResumePaths.copyResume,
            url: ResumePaths.copyResume.url.replace('{resumeId}', params.resumeId)
        };
        return await this.http.request<Result<CopyResumeOutDto>>(path, params);
    }

    /**
     * 获取简历文本
     */
    public async getResumeText(resumeId: string): Promise<Result<EmptyOutDto>> {
        const path = {
            ...ResumePaths.getResumeText,
            url: ResumePaths.getResumeText.url.replace('{resumeId}', resumeId)
        };
        return await this.http.request<Result<EmptyOutDto>>(path, {});
    }
}
