import { InterviewPaths } from '@/api/interview/InterviewPaths'
import HttpClient from '@/api/HttpClient'
import { inject } from 'vue'
import { GetInterviewRecordsInDto, GetInterviewRecordsOutDto } from '@/api/interview/dto/GetInterviewRecords'
import { DeleteInterviewRecordInDto, DeleteInterviewRecordOutDto } from '@/api/interview/dto/DeleteInterviewRecord'
import { Result } from '@/api/BaseDto'
import { EmptyOutDto } from '@/api/HttpClient'

export class InterviewService {
    // 静态属性，用于存储类的唯一实例
    private static instance: InterviewService;
    private http: HttpClient;

    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    // 静态方法，用于获取类的唯一实例
    public static getInstance(): InterviewService {
        if (!InterviewService.instance) {
            InterviewService.instance = new InterviewService();
        }
        return InterviewService.instance;
    }
    
    /**
     * 获取面试记录列表
     */
    public async getInterviewRecords(params: GetInterviewRecordsInDto): Promise<Result<GetInterviewRecordsOutDto>> {
        return await this.http.request<Result<GetInterviewRecordsOutDto>>(InterviewPaths.getInterviewRecords, params);
    }
    
    /**
     * 删除面试记录
     */
    public async deleteInterviewRecord(uuid: string): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(InterviewPaths.deleteInterviewRecord, {uuid});
    }
}
