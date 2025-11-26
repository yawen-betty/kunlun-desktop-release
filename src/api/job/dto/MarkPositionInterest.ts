import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class MarkPositionInterestInDto extends BaseInDto {
    /**
     * 匹配结果的UUID
     */
    uuid: string = '';
    
    /**
     * 是否感兴趣
     */
    isInterested: boolean = false;
}

export class MarkPositionInterestOutDto extends BaseOutDto {
}