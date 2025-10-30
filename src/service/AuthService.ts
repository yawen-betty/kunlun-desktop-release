import {AuthPaths} from '@/api/auth/AuthPaths'
import HttpClient, {EmptyOutDto} from '@/api/HttpClient'
import {inject} from 'vue'
import {WechatLoginInDto, WechatLoginOutDto} from '@/api/auth/dto/WechatLogin'
import {LogoutInDto} from '@/api/auth/dto/Logout'
import {WechatCallbackInDto, WechatCallbackOutDto} from '@/api/auth/dto/WechatCallback'
import {GetTokenInDto, GetTokenOutDto} from '@/api/auth/dto/GetToken'
import {Result} from '@/api/BaseDto'

export class AuthService {
    private http: HttpClient;
    private static instance: AuthService;


    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }


    /**
     * 微信登录
     */
    public async wechatLogin(params: WechatLoginInDto): Promise<Result<WechatLoginOutDto>> {
        return await this.http.request<Result<WechatLoginOutDto>>(AuthPaths.wechatLogin, params);
    }

    /**
     * 退出登录
     */
    public async logout(params: LogoutInDto): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(AuthPaths.logout, params);
    }

    /**
     * 微信登录回调
     */
    public async wechatCallback(params: WechatCallbackInDto): Promise<Result<WechatCallbackOutDto>> {
        return await this.http.request<Result<WechatCallbackOutDto>>(AuthPaths.wechatCallback, params);
    }

    /**
     * 获取登录Token
     */
    public async getToken(params: GetTokenInDto): Promise<Result<GetTokenOutDto>> {
        return await this.http.request<Result<GetTokenOutDto>>(AuthPaths.getToken, params);
    }
}
