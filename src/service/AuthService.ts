import { AuthPath } from '@/api/auth/AuthPath'
import HttpClient from '@/api/HttpClient'
import { inject } from 'vue'
import { WechatLoginInDto, WechatLoginOutDto } from '@/api/auth/dto/WechatLogin'
import { Result } from '@/api/BaseDto'

export class AuthService {
    private http: HttpClient;
    // 静态属性，用于存储类的唯一实例
    private static instance: AuthService;
    
    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    // 静态方法，用于获取类的唯一实例
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    
    /**
     * 微信登录
     * @param {WechatLoginInDto} params - 微信登录参数
     * @returns {Promise<Result<WechatLoginOutDto>>} 登录结果
     */
    public async wechatLogin(params: WechatLoginInDto): Promise<Result<WechatLoginOutDto>> {
        return await this.http.request<Result<WechatLoginOutDto>>(AuthPath.wechatLogin, params);
    }
}