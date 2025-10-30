import {AdminPaths} from '@/api/admin/AdminPaths'
import HttpClient from '@/api/HttpClient'
import {inject} from 'vue'
import {GetConfigInDto, GetConfigOutDto} from '@/api/admin/dto/GetConfig'
import {GetAgreementInDto, GetAgreementOutDto} from '@/api/admin/dto/GetAgreement'
import {Result} from '@/api/BaseDto'

export class AdminService {
    private http: HttpClient;
    private static instance: AdminService;

    constructor() {
        this.http = inject('$http') as HttpClient;
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
}
