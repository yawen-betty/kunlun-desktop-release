import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class CheckNewPositionsInDto extends BaseInDto {
    /**
     * 关联的求职任务UUID
     */
    taskUuid: string = '';
    
    /**
     * 最新的推荐时间戳 (例如: 1678886400000)
     */
    latestRecommendedAt: number = 0;
}

export class CheckNewPositionsOutDto extends BaseOutDto {
    /**
     * 是否有新的匹配职位 (true:有, false:无)
     */
    hasNewPositions: boolean = false;
}
