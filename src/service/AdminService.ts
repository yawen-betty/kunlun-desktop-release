import { AdminPaths } from '@/api/admin/AdminPaths';
import HttpClient from '@/api/HttpClient';
import { inject } from 'vue';
import { GetConfigInDto, GetConfigOutDto } from '@/api/admin/dto/GetConfig';
import { GetAgreementsInDto, GetAgreementsOutDto } from '@/api/admin/dto/GetAgreements';
import { Result } from '@/api/BaseDto';

export class AdminService {
    private http: HttpClient;
    // 静态属性，用于存储类的唯一实例
    private static instance: AdminService;
    
    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    // 静态方法，用于获取类的唯一实例
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
    public async getAgreements(params: GetAgreementsInDto): Promise<Result<GetAgreementsOutDto>> {
        const path = {
            ...AdminPaths.getAgreements,
            url: `/agreements/${params.type}`
        };
        return await this.http.request<Result<GetAgreementsOutDto>>(path, params);
    }
}