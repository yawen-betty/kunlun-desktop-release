import { FilePaths } from '@/api/file/FilePaths'
import HttpClient from '@/api/HttpClient'
import { inject } from 'vue'
import { UploadInDto, UploadOutDto } from '@/api/file/dto/Upload'
import { Result } from '@/api/BaseDto'

export class FileService {
    private http: HttpClient;
    // 静态属性，用于存储类的唯一实例
    private static instance: FileService;
    
    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    // 静态方法，用于获取类的唯一实例
    public static getInstance(): FileService {
        if (!FileService.instance) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }
    
    /**
     * 上传文件
     */
    public async upload(params: UploadInDto): Promise<Result<UploadOutDto>> {
        return await this.http.request<Result<UploadOutDto>>(FilePaths.upload, params);
    }
}