import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

/**
 * 查询新匹配职位输入
 */
export class CheckNewPositionsInDto extends BaseInDto {
    /**
     * 关联的求职任务UUID
     */
    taskUuid: string = '';

    /**
     * 最新的推荐时间戳
     */
    latestRecommendedAt: number = 0;
}

/**
 * 查询新匹配职位输出
 */
export class CheckNewPositionsOutDto extends BaseOutDto {
    /**
     * 是否有新的匹配职位 (true:有, false:无)
     */
    hasNew: boolean = false;

    /**
     * 是否超过推荐上限 (true:超过上限, false:未超过上限)
     */
    upperLimit: boolean = false;
}
