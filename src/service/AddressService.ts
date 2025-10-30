import { AddressPaths } from '@/api/address/AddressPaths'
import HttpClient from '@/api/HttpClient'
import { inject } from 'vue'
import { QueryAreaInDto, QueryAreaOutDto } from '@/api/address/dto/QueryArea'
import { SearchAreaInDto, SearchAreaOutDto } from '@/api/address/dto/SearchArea'
import { Result } from '@/api/BaseDto'

export class AddressService {
    private http: HttpClient;
    // 静态属性，用于存储类的唯一实例
    private static instance: AddressService;
    
    constructor() {
        this.http = inject('$http') as HttpClient;
    }

    // 静态方法，用于获取类的唯一实例
    public static getInstance(): AddressService {
        if (!AddressService.instance) {
            AddressService.instance = new AddressService();
        }
        return AddressService.instance;
    }
    
    /**
     * 查询地区
     */
    public async queryArea(params: QueryAreaInDto): Promise<Result<QueryAreaOutDto>> {
        return await this.http.request<Result<QueryAreaOutDto>>(AddressPaths.queryArea, params);
    }
    
    /**
     * 搜索地区
     */
    public async searchArea(params: SearchAreaInDto): Promise<Result<SearchAreaOutDto>> {
        return await this.http.request<Result<SearchAreaOutDto>>(AddressPaths.searchArea, params);
    }
}