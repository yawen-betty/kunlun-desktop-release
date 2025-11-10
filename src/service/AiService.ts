import { AiPaths } from '@/api/ai/AiPaths';
import HttpClient from '@/api/HttpClient';
import { inject } from 'vue';
import { GenerateTemplateInDto, GenerateTemplateOutDto } from '@/api/ai/dto/GenerateTemplate';
import { ParseAttachmentInDto, ParseAttachmentOutDto } from '@/api/ai/dto/ParseAttachment';
import { DiagnoseInDto, DiagnoseOutDto } from '@/api/ai/dto/Diagnose';
import { WriteInDto, WriteOutDto } from '@/api/ai/dto/Write';
import { PolishInDto, PolishOutDto } from '@/api/ai/dto/Polish';
import { SaveConversationInDto, SaveConversationOutDto } from '@/api/ai/dto/SaveConversation';
import { QueryConversationInDto, QueryConversationOutDto } from '@/api/ai/dto/QueryConversation';
import { Result } from '@/api/BaseDto';
import { EmptyOutDto } from '@/api/HttpClient';

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
     * 生成简历模板
     */
    public async generateTemplate(params: GenerateTemplateInDto): Promise<Result<GenerateTemplateOutDto>> {
        return await this.http.request<Result<GenerateTemplateOutDto>>(AiPaths.generateTemplate, params);
    }

    /**
     * 解析简历附件
     */
    public async parseAttachment(params: ParseAttachmentInDto): Promise<Result<ParseAttachmentOutDto>> {
        return await this.http.request<Result<ParseAttachmentOutDto>>(AiPaths.parseAttachment, params);
    }

    /**
     * 诊断简历
     */
    public async diagnose(params: DiagnoseInDto): Promise<Result<DiagnoseOutDto>> {
        return await this.http.request<Result<DiagnoseOutDto>>(AiPaths.diagnose, params);
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
    public async polish(params: PolishInDto): Promise<Result<PolishOutDto>> {
        return await this.http.request<Result<PolishOutDto>>(AiPaths.polish, params);
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
