import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class GetAgreementsInDto extends BaseInDto {
    /**
     * 协议类型 (1:服务协议, 2:隐私协议)
     */
    type: number = 0;
}

export class GetAgreementsOutDto extends BaseOutDto {
    /**
     * 协议名称
     */
    name: string = '';

    /**
     * 协议类型
     */
    agreementType: number = 0;

    /**
     * 协议文件URL
     */
    agreementFileUrl: string = '';

    /**
     * 更新时间 (时间戳字符串)
     */
    updateTime: string = '';
}