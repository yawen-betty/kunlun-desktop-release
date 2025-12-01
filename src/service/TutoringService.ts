import { TutoringPaths } from '@/api/tutoring/TutoringPaths'
import HttpClient from '@/api/HttpClient'
import { inject } from 'vue'
import { GetTutoringRecordsInDto, GetTutoringRecordsOutDto } from '@/api/tutoring/dto/GetTutoringRecords'
import { DeleteTutoringRecordInDto, DeleteTutoringRecordOutDto } from '@/api/tutoring/dto/DeleteTutoringRecord'
import { DownloadTutoringPdfInDto, DownloadTutoringPdfOutDto } from '@/api/tutoring/dto/DownloadTutoringPdf'
import { Result } from '@/api/BaseDto'
import { EmptyOutDto } from '@/api/HttpClient'

export class TutoringService {
    // 静态属性，用于存储类的唯一实例
    private static instance: TutoringService;
    private http: HttpClient;

    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    // 静态方法，用于获取类的唯一实例
    public static getInstance(): TutoringService {
        if (!TutoringService.instance) {
            TutoringService.instance = new TutoringService();
        }
        return TutoringService.instance;
    }
    
    /**
     * 获取辅导记录列表
     */
    public async getTutoringRecords(params: GetTutoringRecordsInDto): Promise<Result<GetTutoringRecordsOutDto>> {
        return await this.http.request<Result<GetTutoringRecordsOutDto>>(TutoringPaths.getTutoringRecords, params);
    }
    
    /**
     * 删除辅导记录
     */
    public async deleteTutoringRecord(uuid: string): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(TutoringPaths.deleteTutoringRecord, {uuid});
    }
    
    /**
     * 下载辅导记录PDF
     */
    public async downloadTutoringPdf(uuid: string): Promise<Result<DownloadTutoringPdfOutDto>> {
        return await this.http.request<Result<DownloadTutoringPdfOutDto>>(TutoringPaths.downloadTutoringPdf, {uuid});
    }
}
