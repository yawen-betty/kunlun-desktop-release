import { BaseInDto, BaseOutDto } from "@/api/BaseDto";
import { ChannelPositionBean } from "@/api/job/dto/bean/ChannelPositionBean";

export class CrawlPositionsInDto extends BaseInDto {
    /**
     * 关联的求职任务UUID
     */
    taskUuid: string = '';
    
    /**
     * 爬取到的职位数据
     */
    positions: ChannelPositionBean = new ChannelPositionBean();
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