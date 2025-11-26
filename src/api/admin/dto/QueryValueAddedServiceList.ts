import {BaseInDto, BaseOutDto} from "@/api/BaseDto";
import {ValueAddedServiceBean} from "@/api/admin/dto/bean/ValueAddedServiceBean";

/**
 * 获取增值服务列表 - 请求DTO
 */
export class QueryValueAddedServiceListInDto extends BaseInDto {
}

/**
 * 获取增值服务列表 - 响应DTO
 */
export class QueryValueAddedServiceListOutDto extends BaseOutDto {
    /**
     * 增值服务列表
     */
    data: ValueAddedServiceBean[] = [];
}
