import {BaseInDto, BaseOutDto} from "@/api/BaseDto";

export class GetAgreementInDto extends BaseInDto {
    /**
     * 协议类型 (1:服务协议, 2:隐私协议)
     */
    type: number = 0;
}

export class GetAgreementOutDto extends BaseOutDto {
    /**
     * 协议地址
     */
    agreementFileUrl: string = '';

    /**
     * 协议类型
     */
    agreementType: number = 0;

    /**
     * 协议名字
     */
    name: string = '';
    
    /**
     * 更新时间 (时间戳)
     */
    updateTime: string = '';
}
