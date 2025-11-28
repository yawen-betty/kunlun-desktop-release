import {AdminPaths} from '@/api/admin/AdminPaths';
import HttpClient from '@/api/HttpClient';
import {inject} from 'vue';
import {GetConfigInDto, GetConfigOutDto} from '@/api/admin/dto/GetConfig';
import {GetAgreementInDto, GetAgreementOutDto} from '@/api/admin/dto/GetAgreement.ts';
import {GetAiRegisterGuideInDto, GetAiRegisterGuideOutDto} from '@/api/admin/dto/GetAiRegisterGuide';
import {QueryValueAddedServiceListInDto, QueryValueAddedServiceListOutDto} from '@/api/admin/dto/QueryValueAddedServiceList';
import {AddFeedbackInDto, AddFeedbackOutDto} from '@/api/admin/dto/AddFeedback';
import {QueryFeedbackListInDto, QueryFeedbackListOutDto} from '@/api/admin/dto/QueryFeedbackList';
import {GetMakeAdviceInDto, GetMakeAdviceOutDto} from '@/api/admin/dto/GetMakeAdvice';
import {GetHelpCenterInDto, GetHelpCenterOutDto} from '@/api/admin/dto/GetHelpCenter';
import {GetHelpCenterStatusInDto, GetHelpCenterStatusOutDto} from '@/api/admin/dto/GetHelpCenterStatus';
import {GetWebsiteUrlInDto, GetWebsiteUrlOutDto} from '@/api/admin/dto/GetWebsiteUrl';
import {Result} from '@/api/BaseDto';

export class AdminService {
    private http: HttpClient;
    private static instance: AdminService;

    constructor() {
        this.http = new HttpClient();
    }

    public static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    /**
     * 获取公共应用配置
     */
    public async getConfig(params: GetConfigInDto): Promise<Result<GetConfigOutDto>> {
        return await this.http.request<Result<GetConfigOutDto>>(AdminPaths.getConfig, params);
    }

    /**
     * 获取协议内容
     */
    public async getAgreements(params: GetAgreementInDto): Promise<Result<GetAgreementOutDto>> {
        return await this.http.request<Result<GetAgreementOutDto>>(AdminPaths.getAgreements, params);
    }

    /**
     * 获取AI注册引导
     */
    public async getAiRegisterGuide(params: GetAiRegisterGuideInDto): Promise<Result<GetAiRegisterGuideOutDto>> {
        return await this.http.request<Result<GetAiRegisterGuideOutDto>>(AdminPaths.getAiRegisterGuide, params);
    }

    /**
     * 获取增值服务列表
     */
    public async queryValueAddedServiceList(params: QueryValueAddedServiceListInDto): Promise<Result<QueryValueAddedServiceListOutDto>> {
        return await this.http.request<Result<QueryValueAddedServiceListOutDto>>(AdminPaths.queryValueAddedServiceList, params);
    }

    /**
     * 提交问题反馈
     */
    public async addFeedback(params: AddFeedbackInDto): Promise<Result<AddFeedbackOutDto>> {
        return await this.http.request<Result<AddFeedbackOutDto>>(AdminPaths.addFeedback, params);
    }

    /**
     * 获取反馈的回复列表
     */
    public async queryFeedbackList(params: QueryFeedbackListInDto): Promise<Result<QueryFeedbackListOutDto>> {
        return await this.http.request<Result<QueryFeedbackListOutDto>>(AdminPaths.queryFeedbackList, params);
    }

    /**
     * 预约咨询
     */
    public async getMakeAdvice(params: GetMakeAdviceInDto): Promise<Result<GetMakeAdviceOutDto>> {
        return await this.http.request<Result<GetMakeAdviceOutDto>>(AdminPaths.getMakeAdvice, params);
    }

    /**
     * 获取帮助中心状态
     */
    public async getHelpCenterStatus(params: GetHelpCenterStatusInDto): Promise<Result<GetHelpCenterStatusOutDto>> {
        return await this.http.request<Result<GetHelpCenterStatusOutDto>>(AdminPaths.getHelpCenterStatus, params);
    }

    /**
     * 获取帮助中心内容
     */
    public async getHelpCenter(params: GetHelpCenterInDto): Promise<Result<GetHelpCenterOutDto>> {
        return await this.http.request<Result<GetHelpCenterOutDto>>(AdminPaths.getHelpCenter, params);
    }

    /**
     * 获取官网地址
     */
    public async getWebsiteUrl(params: GetWebsiteUrlInDto): Promise<Result<GetWebsiteUrlOutDto>> {
        return await this.http.request<Result<GetWebsiteUrlOutDto>>(AdminPaths.getWebsiteUrl, params);
    }
}
