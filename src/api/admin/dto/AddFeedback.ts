import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

/**
 * 提交问题反馈 - 请求DTO
 */
export class AddFeedbackInDto extends BaseInDto {
    /**
     * 问题标题
     */
    title: string = '';

    /**
     * 问题描述文本
     */
    problem: string = '';

    /**
     * 问题截图文件，最多3个
     */
    problemImages?: string[];
}

/**
 * 提交问题反馈 - 响应DTO
 */
export class AddFeedbackOutDto extends BaseOutDto {
}
