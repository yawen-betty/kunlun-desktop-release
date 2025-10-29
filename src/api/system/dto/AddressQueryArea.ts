import {BaseInDto, BaseOutDto} from "@/api/BaseDto";
import {AreaInfoBean} from '@/api/system/dto/bean/AreaInfoBean.ts'


export class AddressQueryAreaInDto extends BaseInDto {
    /**
     * 范围类型（null查所有, 1-中国, 2-海外）
     */
    rangeType?: string;

    /**
     * 查询最深层级
     */
    maxLevel: number = 0;
}

export class AddressQueryAreaOutDto extends BaseOutDto {
    /**
     * 地区列表
     */
    areaList: AreaInfoBean[] = [];
}
