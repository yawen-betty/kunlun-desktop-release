import {AddressPaths} from '@/api/address/AddressPaths';
import HttpClient from '@/api/HttpClient';
import {inject} from 'vue';
import {QueryAreaInDto, QueryAreaOutDto} from '@/api/address/dto/QueryArea';
import {Result} from '@/api/BaseDto';
import {AreaInfoBean} from '@/api/user/dto/bean/AreaInfoBean';
import {SearchAreaOutDto} from "@/api/address/dto/SearchArea.ts";

export class AddressService {
    private http: HttpClient;
    private static instance: AddressService;

    constructor() {
        this.http = inject('$http') as HttpClient;
    }

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
    public async searchArea(params: {
        rangeType?: string;
        maxLevel?: number;
        keyWord: string
    }): Promise<Result<SearchAreaOutDto>> {
        return await this.http.request<Result<SearchAreaOutDto>>(AddressPaths.searchArea, params);
    }
}
