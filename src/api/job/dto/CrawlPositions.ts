import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ChannelPositionBean } from "@/api/job/dto/bean/ChannelPositionBean";
import { MatchInfoBean } from "@/api/job/dto/bean/MatchInfoBean";

export class CrawlPositionsInDto extends BaseInDto {
    /**
     * 关联的求职任务UUID
     */
    taskUuid: string = '';
    
    /**
     * 爬取到的职位数据
     */
    positions: ChannelPositionBean = new ChannelPositionBean();
    
    /**
     * 匹配结果
     */
    matchInfo?: MatchInfoBean;
}

export class CrawlPositionsOutDto extends BaseOutDto {
    /**
     * 处理成功的数量
     */
    processedCount: number = 0;
    
    /**
     * 处理失败的数量
     */
    failedCount: number = 0;
}