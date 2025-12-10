import {BaseInDto, BaseOutDto} from "@/api/BaseDto";
import {PositionBean} from "@/api/job/dto/bean/PositionBean";

export class GetJobTaskInDto extends BaseInDto {
}

export class GetJobTaskOutDto extends BaseOutDto {
    /**
     * 主键
     */
    uuid: string = '';

    /**
     * 任务名称
     */
    taskName: string = '';

    /**
     * 求职岗位
     */
    jobTitle: string = '';

    /**
     * 期望城市区域代码
     */
    cityCode: string = '';

    /**
     * 期望城市名称
     */
    cityName: string = '';

    /**
     * 工作经验
     */
    experience: string = '';

    /**
     * 关联的简历UUID
     */
    resumeUuid: string = '';

    /**
     * 任务状态 (0: 运行中)
     */
    status: number = 0;

    /**
     * 是否有简历
     */
    resumeExit: boolean;

    /**
     * 是否为默认任务
     */
    isDefault: boolean = false;

    /**
     * 该任务下所有已爬取的职位列表
     */
    positions: PositionBean[] = [];
}
