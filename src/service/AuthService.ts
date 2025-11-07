import {AuthPaths} from '@/api/auth/AuthPaths';
import HttpClient from '@/api/HttpClient';
import {inject} from 'vue';
import {WechatLoginInDto, WechatLoginOutDto} from '@/api/auth/dto/WechatLogin';
import {GenerateQrcodeInDto, GenerateQrcodeOutDto} from '@/api/auth/dto/GenerateQrcode';
import {Result} from '@/api/BaseDto';
import {EmptyOutDto} from '@/api/HttpClient';
import {GetTokenOutDto} from "@/api/auth/dto/GetToken.ts";

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
    public async logout(): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(AuthPaths.logout, {});
    }

    /**
     * 生成微信扫码登录二维码
     */
    public async generateQrcode(params: GenerateQrcodeInDto): Promise<Result<GenerateQrcodeOutDto>> {
        return await this.http.request<Result<GenerateQrcodeOutDto>>(AuthPaths.generateQrcode, params);
    }

    /**
     * 获取登录Token
     */
    public async getToken(state: string): Promise<Result<GetTokenOutDto>> {
        const path = { ...AuthPaths.getToken, url: `${AuthPaths.getToken.url}/${state}` };
        return await this.http.request<Result<GetTokenOutDto>>(path, {});
    }
}
