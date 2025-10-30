import { FilePaths } from '@/api/file/FilePaths'
import HttpClient from '@/api/HttpClient'
import { inject } from 'vue'
import { UploadInDto, UploadOutDto } from '@/api/file/dto/Upload'
import { Result } from '@/api/BaseDto'

export class FileService {
    private http: HttpClient;
    private static instance: FileService;
    
    constructor() {
        this.http = inject('$http') as HttpClient;
    }

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