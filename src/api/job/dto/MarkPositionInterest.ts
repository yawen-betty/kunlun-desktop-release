import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class MarkPositionInterestInDto extends BaseInDto {
    /**
     * 是否感兴趣
     */
    isInterested: boolean = false;
}

export class MarkPositionInterestOutDto extends BaseOutDto {
}