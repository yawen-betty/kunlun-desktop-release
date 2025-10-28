import { AdminPath } from '@/api/admin/AdminPath'
import HttpClient from '@/api/HttpClient'
import { inject } from 'vue'
import { Result } from '@/api/BaseDto'
import { GetConfigInDto, GetConfigOutDto } from '@/api/admin/dto/GetConfig'
import { GetAgreementInDto, GetAgreementOutDto } from '@/api/admin/dto/GetAgreement'

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
     * @param {GetConfigInDto} params - 请求参数（无实际参数）
     * @returns {Promise<Result<GetConfigOutDto>>} 应用配置
     */
    public async getConfig(params: GetConfigInDto): Promise<Result<GetConfigOutDto>> {
        return await this.http.request<Result<GetConfigOutDto>>(AdminPath.getConfig, params);
    }
    
    /**
     * 获取协议内容
     * @param {GetAgreementInDto} params - 协议类型参数
     * @returns {Promise<Result<GetAgreementOutDto>>} 协议内容
     */
    public async getAgreement(params: GetAgreementInDto): Promise<Result<GetAgreementOutDto>> {
        // 构建带路径参数的URL
        const pathWithParams = {
            ...AdminPath.getAgreement,
            url: AdminPath.getAgreement.url.replace('{type}', params.type.toString())
        };
        return await this.http.request<Result<GetAgreementOutDto>>(pathWithParams, {});
    }
}