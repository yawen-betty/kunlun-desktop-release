import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetAgreementInDto extends BaseInDto {
    /**
     * 协议类型 (1:服务协议, 2:隐私协议)
     * @type {number}
     */
    type: number = 0;
}

export class GetAgreementOutDto extends BaseOutDto {
    /**
     * 协议类型
     * @type {number}
     */
    agreementType: number = 0;

    /**
     * 协议内容（HTML格式）
     * @type {string}
     */
    content: string = '';

    /**
     * 更新时间
     * @type {string}
     */
    updateTime: string = '';
}