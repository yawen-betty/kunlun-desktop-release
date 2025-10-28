import { SystemPath } from '@/api/system/SystemPath';
import HttpClient from '@/api/HttpClient';
import { inject } from 'vue';
import { QueryAreaInDto, QueryAreaOutDto } from '@/api/system/dto/QueryArea';
import { SearchAreaInDto, SearchAreaOutDto } from '@/api/system/dto/SearchArea';
import { AddressQueryAreaInDto, AddressQueryAreaOutDto } from '@/api/system/dto/AddressQueryArea';
import { AddressSearchAreaInDto, AddressSearchAreaOutDto } from '@/api/system/dto/AddressSearchArea';
import { Result } from '@/api/BaseDto';

export class SystemService {
    private http: HttpClient;
    // 静态属性，用于存储类的唯一实例
    private static instance: SystemService;
    
    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    // 静态方法，用于获取类的唯一实例
    public static getInstance(): SystemService {
        if (!SystemService.instance) {
            SystemService.instance = new SystemService();
        }
        return SystemService.instance;
    }
    
    /**
     * 查询地区
     */
    public async queryArea(params: QueryAreaInDto): Promise<Result<QueryAreaOutDto>> {
        return await this.http.request<Result<QueryAreaOutDto>>(SystemPath.QueryArea, params);
    }
    
    /**
     * 搜索地区
     */
    public async searchArea(params: SearchAreaInDto): Promise<Result<SearchAreaOutDto>> {
        return await this.http.request<Result<SearchAreaOutDto>>(SystemPath.SearchArea, params);
    }

    /**
     * 查询地区 (地址模块)
     */
    public async addressQueryArea(params: AddressQueryAreaInDto): Promise<Result<AddressQueryAreaOutDto>> {
        return await this.http.request<Result<AddressQueryAreaOutDto>>(SystemPath.AddressQueryArea, params);
    }

    /**
     * 搜索地区 (地址模块)
     */
    public async addressSearchArea(params: AddressSearchAreaInDto): Promise<Result<AddressSearchAreaOutDto>> {
        return await this.http.request<Result<AddressSearchAreaOutDto>>(SystemPath.AddressSearchArea, params);
    }
}