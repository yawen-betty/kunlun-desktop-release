import { UserPath } from '@/api/user/UserPath'
import HttpClient from '@/api/HttpClient'
import { inject } from 'vue'
import { Result } from '@/api/BaseDto'
import { EmptyOutDto } from '@/api/HttpClient'
import { InitProfileInDto } from '@/api/user/dto/InitProfile'
import { GetProfileInDto, GetProfileOutDto } from '@/api/user/dto/GetProfile'
import { UpdateProfileInDto } from '@/api/user/dto/UpdateProfile'
import { UploadAvatarInDto, UploadAvatarOutDto } from '@/api/user/dto/UploadAvatar'
import { GetModelAccountInDto, GetModelAccountOutDto } from '@/api/user/dto/GetModelAccount'
import { SaveModelAccountInDto } from '@/api/user/dto/SaveModelAccount'

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
     * @param {InitProfileInDto} params - 用户基本信息
     * @returns {Promise<Result<EmptyOutDto>>} 操作结果
     */
    public async initProfile(params: InitProfileInDto): Promise<Result<EmptyOutDto>> {
        return await this.http.request<Result<EmptyOutDto>>(UserPath.initProfile, params);
    }
    
    /**
     * 获取当前用户信息
     * @param {GetProfileInDto} params - 请求参数（无实际参数）
     * @returns {Promise<Result<GetProfileOutDto>>} 用户信息
     */
    public async getProfile(params: GetProfileInDto): Promise<Result<GetProfileOutDto>> {
        return await this.http.request<Result<GetProfileOutDto>>(UserPath.getProfile, params);
    }
    
    /**
     * 更新当前用户信息
     * @param {UpdateProfileInDto} params - 更新的用户信息
     * @returns {Promise<Result<EmptyOutDto>>} 操作结果
     */
    public async updateProfile(params: UpdateProfileInDto): Promise<Result<EmptyOutDto>> {
        return await this.http.request<Result<EmptyOutDto>>(UserPath.updateProfile, params);
    }
    
    /**
     * 上传头像
     * @param {string} filePath - 文件路径
     * @returns {Promise<Result<UploadAvatarOutDto>>} 上传结果
     */
    public async uploadAvatar(filePath: string): Promise<Result<UploadAvatarOutDto>> {
        return await this.http.uploadFile<Result<UploadAvatarOutDto>>(
            UserPath.uploadAvatar,
            filePath,
            'file'
        );
    }
    
    /**
     * 获取模型账号配置
     * @param {GetModelAccountInDto} params - 请求参数（无实际参数）
     * @returns {Promise<Result<GetModelAccountOutDto>>} 账号配置
     */
    public async getModelAccount(params: GetModelAccountInDto): Promise<Result<GetModelAccountOutDto>> {
        return await this.http.request<Result<GetModelAccountOutDto>>(UserPath.getModelAccount, params);
    }
    
    /**
     * 保存模型账号配置
     * @param {SaveModelAccountInDto} params - API Key信息
     * @returns {Promise<Result<EmptyOutDto>>} 操作结果
     */
    public async saveModelAccount(params: SaveModelAccountInDto): Promise<Result<EmptyOutDto>> {
        return await this.http.request<Result<EmptyOutDto>>(UserPath.saveModelAccount, params);
    }
}