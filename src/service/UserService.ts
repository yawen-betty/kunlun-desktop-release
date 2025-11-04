import {UserPaths} from '@/api/user/UserPaths';
import HttpClient from '@/api/HttpClient';
import {inject} from 'vue';
import {InitProfileInDto, InitProfileOutDto} from '@/api/user/dto/InitProfile';
import {GetProfileInDto, GetProfileOutDto} from '@/api/user/dto/GetProfile';
import {Result} from '@/api/BaseDto';
import {EmptyOutDto} from '@/api/HttpClient';
import {UpdateProfileInDto} from "@/api/user/dto/UpdateProfile.ts";
import {GetModelAccountInDto, GetModelAccountOutDto} from "@/api/user/dto/GetModelAccount.ts";
import {SaveModelAccountInDto, SaveModelAccountOutDto} from "@/api/user/dto/SaveModelAccount.ts";

export class UserService {
    private http: HttpClient;
    private static instance: UserService;

    constructor() {
        this.http = new HttpClient();
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * 补全基本信息
     */
    public async initProfile(params: InitProfileInDto): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(UserPaths.initProfile, params);
    }

    /**
     * 获取当前用户信息
     */
    public async getProfile(params: GetProfileInDto): Promise<Result<GetProfileOutDto>> {
        return await this.http.request<Result<GetProfileOutDto>>(UserPaths.getProfile, params);
    }

    /**
     * 更新当前用户信息
     */
    public async updateProfile(params: UpdateProfileInDto): Promise<Result<GetProfileOutDto>> {
        return await this.http.request<Result<GetProfileOutDto>>(UserPaths.updateProfile, params);
    }

    /**
     * 获取模型账号配置
     */
    public async getModelAccount(params: GetModelAccountInDto): Promise<Result<GetModelAccountInDto>> {
        return await this.http.request<Result<GetModelAccountOutDto>>(UserPaths.getModelAccount, params);
    }

    /**
     * 保存模型账号配置
     */
    public async saveModelAccount(params: SaveModelAccountInDto): Promise<Result<SaveModelAccountOutDto>> {
        return await this.http.request<Result<SaveModelAccountOutDto>>(UserPaths.saveModelAccount, params);
    }
}
