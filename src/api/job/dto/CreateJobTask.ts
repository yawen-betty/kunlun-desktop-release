import {BaseInDto, BaseOutDto} from "@/api/BaseDto";
import {AreaInfoBean} from "@/api/job/dto/bean/AreaInfoBean";

export class CreateJobTaskInDto extends BaseInDto {
    /**
     * 任务名称
     */
    taskName?: string;

    /**
     * 求职岗位
     */
    jobTitle: string = '';

    /**
     * 期望城市列表
     */
    cityInfos: AreaInfoBean[] = [];

    /**
     * 工作经验(1:在校/应届生 2:1年以下 3:1-3年 4:3-5年 5:5-10年 6:10年以上)
     */
    experience: string = '';

    /**
     * 关联的简历UUID
     */
    resumeUuid: string = '';

    /**
     * 是否设为默认任务
     */
    isDefault?: boolean;

    /**
     * 是否立即发布 (默认为 false)
     */
    publish?: boolean;
}

export class CreateJobTaskOutDto extends BaseOutDto {
    /**
     * 创建成功返回的数量
     */
    value: number = 0;
}
