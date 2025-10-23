import { Result } from "@/api/BaseDto";
import { EmptyOutDto } from "@/api/HttpClient";
import { SystemPath } from "@/api/system/SystemPath";
import {inject} from "vue";
import HttpClient from "@/api/HttpClient";

/**
 * 系统模块服务类
 */
export class SystemService {
  http = inject('$http') as HttpClient;
  // 静态属性，用于存储类的唯一实例
  private static instance: SystemService;

  // 私有构造函数，防止外部直接实例化
  private constructor() {
    // 初始化代码
  }

  // 静态方法，用于获取类的唯一实例
  public static getInstance(): SystemService {
    if (!SystemService.instance) {
      SystemService.instance = new SystemService();
    }
    return SystemService.instance;
  }

  /**
   * 获取全部地点
   */
  public async queryArea(params: any): Promise<Result<EmptyOutDto>> {
    return await this.http.request<Result<EmptyOutDto>>(SystemPath.QueryArea, params);
  }

  /**
   * 搜索地点
   */
  public async searchArea(params: any): Promise<Result<EmptyOutDto>> {
    return await this.http.request<Result<EmptyOutDto>>(SystemPath.SearchArea, params);
  }
}