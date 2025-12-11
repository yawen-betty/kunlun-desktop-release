import {JobPaths} from '@/api/job/JobPaths'
import HttpClient from '@/api/HttpClient'
import {inject} from 'vue'
import {CreateJobTaskInDto, CreateJobTaskOutDto} from '@/api/job/dto/CreateJobTask'
import {GetJobTaskInDto, GetJobTaskOutDto} from '@/api/job/dto/GetJobTask'
import {DeleteJobTaskInDto, DeleteJobTaskOutDto} from '@/api/job/dto/DeleteJobTask'
import {ActivateJobTaskInDto, ActivateJobTaskOutDto} from '@/api/job/dto/ActivateJobTask'

import {QueryMatchedPositionsInDto, QueryMatchedPositionsOutDto} from '@/api/job/dto/QueryMatchedPositions'
import {MarkPositionInterestInDto, MarkPositionInterestOutDto} from '@/api/job/dto/MarkPositionInterest'
import {SwitchJobTaskInDto, SwitchJobTaskOutDto} from '@/api/job/dto/SwitchJobTask'
import {GetOtherJobTasksInDto, GetOtherJobTasksOutDto} from '@/api/job/dto/GetOtherJobTasks'
import {CrawlPositionsInDto, CrawlPositionsOutDto} from '@/api/job/dto/CrawlPositions'
import {GetPositionReportInDto, GetPositionReportOutDto} from '@/api/job/dto/GetPositionReport'
import {GetPositionDetailInDto, GetPositionDetailOutDto} from '@/api/job/dto/GetPositionDetail'
import {CheckNewPositionsInDto, CheckNewPositionsOutDto} from '@/api/job/dto/CheckNewPositions'
import {Result} from '@/api/BaseDto'
import {EmptyOutDto} from '@/api/HttpClient'

export class JobService {
    // 静态属性，用于存储类的唯一实例
    private static instance: JobService;
    private http: HttpClient;

    constructor() {
        this.http = new HttpClient();
    }

    // 静态方法，用于获取类的唯一实例
    public static getInstance(): JobService {
        if (!JobService.instance) {
            JobService.instance = new JobService();
        }
        return JobService.instance;
    }

    /**
     * 创建一个新的求职任务
     */
    public async createJobTask(params: CreateJobTaskInDto): Promise<Result<CreateJobTaskOutDto>> {
        return await this.http.request<Result<CreateJobTaskOutDto>>(JobPaths.createJobTask, params);
    }

    /**
     * 获取当前执行的求职任务及职位列表
     */
    public async getJobTask(params: GetJobTaskInDto): Promise<Result<GetJobTaskOutDto>> {
        return await this.http.request<Result<GetJobTaskOutDto>>(JobPaths.getJobTask, params, {showLoading: false});
    }

    /**
     * 删除一个求职任务
     */
    public async deleteJobTask(uuid: string): Promise<Result<DeleteJobTaskOutDto>> {
        return await this.http.request<Result<DeleteJobTaskOutDto>>(JobPaths.deleteJobTask, {uuid});
    }

    /**
     * 激活或停用一个求职任务
     */
    public async activateJobTask(params: ActivateJobTaskInDto): Promise<Result<ActivateJobTaskOutDto>> {
        return await this.http.request<Result<ActivateJobTaskOutDto>>(JobPaths.activateJobTask, params, {showLoading: false});
    }

    /**
     * 获取匹配的职位列表（分页）
     */
    public async queryMatchedPositions(params: QueryMatchedPositionsInDto): Promise<Result<QueryMatchedPositionsOutDto>> {
        return await this.http.request<Result<QueryMatchedPositionsOutDto>>(JobPaths.queryMatchedPositions, params, {showLoading: false});
    }

    /**
     * 标记或取消标记感兴趣的职位
     */
    public async markPositionInterest(uuid: string, isInterested: number): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(JobPaths.markPositionInterest, {uuid, isInterested});
    }

    /**
     * 切换并激活指定的求职任务
     */
    public async switchJobTask(uuid: string): Promise<Result<SwitchJobTaskOutDto>> {
        return await this.http.request<Result<SwitchJobTaskOutDto>>(JobPaths.switchJobTask, {uuid});
    }

    /**
     * 获取除当前执行任务外的所有求职任务
     */
    public async getOtherJobTasks(uuid: string): Promise<Result<GetOtherJobTasksOutDto[]>> {
        return await this.http.request<Result<GetOtherJobTasksOutDto[]>>(JobPaths.getOtherJobTasks, {uuid});
    }

    /**
     * 爬虫专用，批量入库职位数据
     */
    public async crawlPositions(params: CrawlPositionsInDto): Promise<Result<CrawlPositionsOutDto>> {
        return await this.http.request<Result<CrawlPositionsOutDto>>(JobPaths.crawlPositions, params);
    }

    /**
     * 根据匹配职位uuid查询职位分析报告
     */
    public async getPositionReport(uuid: string): Promise<Result<GetPositionReportOutDto>> {
        return await this.http.request<Result<GetPositionReportOutDto>>(JobPaths.getPositionReport, {uuid});
    }

    /**
     * 根据匹配职位uuid查询职位详情
     */
    public async getPositionDetail(uuid: string): Promise<Result<GetPositionDetailOutDto>> {
        return await this.http.request<Result<GetPositionDetailOutDto>>(JobPaths.getPositionDetail, {uuid});
    }

    /**
     * 查询是否有新的匹配职位
     */
    public async checkNewPositions(params: CheckNewPositionsInDto): Promise<Result<CheckNewPositionsOutDto>> {
        return await this.http.request<Result<CheckNewPositionsOutDto>>(JobPaths.checkNewPositions, params);
    }
}
