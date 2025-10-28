import { UserPaths } from '@/api/user/UserPaths';
import HttpClient, { EmptyOutDto } from '@/api/HttpClient';
import { inject } from 'vue';
import { InitProfileInDto, InitProfileOutDto } from '@/api/user/dto/InitProfile';
import { GetProfileInDto, GetProfileOutDto } from '@/api/user/dto/GetProfile';
import { UpdateProfileInDto, UpdateProfileOutDto } from '@/api/user/dto/UpdateProfile';
import { UploadAvatarInDto, UploadAvatarOutDto } from '@/api/user/dto/UploadAvatar';
import { GetModelAccountInDto, GetModelAccountOutDto } from '@/api/user/dto/GetModelAccount';
import { SaveModelAccountInDto, SaveModelAccountOutDto } from '@/api/user/dto/SaveModelAccount';
import { Result } from '@/api/BaseDto';

export class UserService {
    private http: HttpClient;
    // 静态属性，用于存储类的唯一实例
    private static instance: UserService;
    
    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    // 静态方法，用于获取类的唯一实例
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
    public async updateProfile(params: UpdateProfileInDto): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(UserPaths.updateProfile, params);
    }
    
    /**
     * 上传头像
     */
    public async uploadAvatar(params: UploadAvatarInDto): Promise<Result<UploadAvatarOutDto>> {
        return await this.http.request<Result<UploadAvatarOutDto>>(UserPaths.uploadAvatar, params);
    }
    
    /**
     * 获取模型账号配置
     */
    public async getModelAccount(params: GetModelAccountInDto): Promise<Result<GetModelAccountOutDto>> {
        return await this.http.request<Result<GetModelAccountOutDto>>(UserPaths.getModelAccount, params);
    }
    
    /**
     * 保存模型账号配置
     */
    public async saveModelAccount(params: SaveModelAccountInDto): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(UserPaths.saveModelAccount, params);
    }
}