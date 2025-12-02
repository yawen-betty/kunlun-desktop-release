import { BaseInDto, BaseOutDto } from "@/api/BaseDto";

export class MarkPositionInterestInDto extends BaseInDto {
    /**
     * 是否感兴趣 (1:是, 0:否)
     */
    isInterested: number = 0;
}

export class MarkPositionInterestOutDto extends BaseOutDto {
}
