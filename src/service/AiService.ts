import {AiPaths} from '@/api/ai/AiPaths';
import HttpClient from '@/api/HttpClient';
import {inject} from 'vue';
import {GenerateTemplateInDto} from '@/api/ai/dto/GenerateTemplate';
import {DiagnoseInDto, DiagnoseOutDto} from '@/api/ai/dto/Diagnose';
import {WriteInDto, WriteOutDto} from '@/api/ai/dto/Write';
import {PolishInDto} from '@/api/ai/dto/Polish';
import {SaveConversationInDto} from '@/api/ai/dto/SaveConversation';
import {QueryConversationInDto, QueryConversationOutDto} from '@/api/ai/dto/QueryConversation';
import {Result} from '@/api/BaseDto';
import {EmptyOutDto} from '@/api/HttpClient';

export class AiService {
    private http: HttpClient;
    private static instance: AiService;

    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    public static getInstance(): AiService {
        if (!AiService.instance) {
            AiService.instance = new AiService();
        }
        return AiService.instance;
    }

    /**
     * 生成简历模板（流式）
     */
    public generateTemplateStream(
        params: GenerateTemplateInDto,
        onMessage: (data: any) => void,
        onError: (error: any) => void,
        onComplete: () => void
    ): void {
        this.http.sseRequest(
            AiPaths.generateTemplate,
            params,
            onMessage,
            onError,
            onComplete
        );
    }

    /**
     * 解析简历附件
     */
    public parseAttachmentStream(
        extraFields: Record<string, string>,
        file: File,
        onMessage: (data: any) => void,
        onError: (error: any) => void,
        onComplete: () => void
    ): void {
        this.http.sseRequest(
            AiPaths.parseAttachment,
            null,
            onMessage,
            onError,
            onComplete,
            {
                file,
                extraFields
            }
        );
    }

    /**
     * 诊断简历
     */
    public diagnoseStream(
        params: DiagnoseInDto,
        onMessage: (data: any) => void,
        onError: (error: any) => void,
        onComplete: () => void
    ): void {
        this.http.sseRequest(
            AiPaths.diagnose,
            params,
            onMessage,
            onError,
            onComplete
        );
    }


    /**
     * 撰写简历内容
     */
    public async write(params: WriteInDto): Promise<Result<WriteOutDto>> {
        return await this.http.request<Result<WriteOutDto>>(AiPaths.write, params);
    }

    /**
     * 局部内容优化
     */
    public polishStream(
        params: PolishInDto,
        onMessage: (data: any) => void,
        onError: (error: any) => void,
        onComplete: () => void
    ): void {
        this.http.sseRequest(
            AiPaths.polish,
            params,
            onMessage,
            onError,
            onComplete
        );
    }

    /**
     * 保存AI会话记录
     */
    public async saveConversation(params: SaveConversationInDto): Promise<EmptyOutDto> {
        return await this.http.request<EmptyOutDto>(AiPaths.saveConversation, params);
    }

    /**
     * 查询AI会话记录
     */
    public async queryConversation(params: QueryConversationInDto): Promise<Result<QueryConversationOutDto>> {
        return await this.http.request<Result<QueryConversationOutDto>>(AiPaths.queryConversation, params);
    }
}
