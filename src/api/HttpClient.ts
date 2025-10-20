import type {App} from "vue";
import {Config} from "@/Config.ts";
import {UserInfo} from "@/utiles/userInfo.ts";
import { invoke } from '@tauri-apps/api/core';
import type { Path } from "@/api/Path.ts";

// 定义请求参数接口
interface HttpRequestParams {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  file_path?: string;
  file_field_name?: string;
}

// 定义响应接口
interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

export default class HttpClient{
  static create(): any {
    return {
      install: (app: App) => {
        app.provide('$http', new HttpClient())
      }
    }
  };

  static baseURL = Config.baseUrl || 'http://mgt.crm.dev.pangu.cc/';
  static token: string | undefined = UserInfo.info?.token;

  // 接口URL拼接
  private static fixUrl(path: Path, data?: any): string {
    let baseUrl = HttpClient.baseURL;
    let urlParts = [];
    
    // 确保baseUrl末尾没有斜杠
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // 确保baseUrl包含协议
    if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      // 如果没有指定协议，默认使用http
      baseUrl = `http://${baseUrl}`;
    }
    
    // 添加基础URL
    if (baseUrl) {
      urlParts.push(baseUrl);
    }
    
    // 添加api路径段
    urlParts.push('api');
    
    // 添加prefix（如果有）
    if (path.prefix) {
      urlParts.push(path.prefix);
    }
    
    // 添加具体的url
    if (path.url) {
      // 确保url不以斜杠开头
      const cleanUrl = path.url.startsWith('/') ? path.url.slice(1) : path.url;
      urlParts.push(cleanUrl);
    }
    
    // 构建完整URL
    let fullUrl = urlParts.join('/');
    
    // 再次确保URL包含协议，如果还是没有的话
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `http://${fullUrl}`;
    }
    
    // 针对 GET 请求处理查询参数
    if (path.method === 'GET' && data && Object.keys(data).length > 0) {
      // 简单处理，URLSearchParams 接受对象
      const params = new URLSearchParams(data).toString();
      // 如果 URL 中已有 ?, 则使用 & 拼接，否则使用 ?
      fullUrl += fullUrl.includes('?') ? `&${params}` : `?${params}`;
    }

    return fullUrl;
  }

  /**
   * 核心请求方法。通过 Path 对象封装了请求的 URL 和 Method。
   *
   * @param path Path 接口对象，包含 url, method, prefix 等。
   * @param data 请求体数据 (仅 POST/PUT 有效)。
   * @param options 额外选项，如文件上传
   * @returns Promise，解析为响应数据 (T)。
   */
  public async request<T>(
    path: Path,
    data?: any,
    options?: {
      file_path?: string;
      file_field_name?: string;
    }
  ): Promise<T> {
    console.log('开始请求:', path);
    console.log('请求数据:', data);
    
    // 对于GET请求，传递data参数用于构建查询字符串
    const fullUrl = HttpClient.fixUrl(path, path.method === 'GET' ? data : undefined);
    console.log('构建的URL:', fullUrl);

    // 请求头和认证逻辑
    let defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (HttpClient.token) {
      defaultHeaders['Authorization'] = `Bearer ${HttpClient.token}`;
    }
    console.log('请求头:', defaultHeaders);

    // 构建请求参数
    const requestParams: HttpRequestParams = {
      url: fullUrl,
      method: path.method,
      headers: defaultHeaders
    };

    // 添加请求体 - 对于非GET请求
    if (path.method !== 'GET' && data) {
      // 对于POST请求，确保数据正确格式化为对象
      requestParams.body = data;
      console.log('请求体:', requestParams.body);
    }

    // 添加文件上传参数
    if (options?.file_path && options?.file_field_name) {
      requestParams.file_path = options.file_path;
      requestParams.file_field_name = options.file_field_name;
      // 文件上传时不需要设置Content-Type，由后端处理
      delete requestParams.headers?.['Content-Type'];
    }

    return new Promise<T>(async (resolve, reject) => {
      try {
        // 调用后端的http_request命令
        const response: HttpResponse = await invoke('http_request', {
          req: requestParams
        });

        console.info('HTTP请求响应:', response);

        // 检查HTTP状态码
        if (response.status >= 200 && response.status < 300) {
          // 返回响应体
          resolve(response.body as T);
        } else {
          reject(new Error(`请求失败: ${response.status} ${JSON.stringify(response.body)}`));
        }
      } catch (error) {
        console.error('HTTP请求错误:', error);
        reject(error);
      }
    });
  }

  /**
   * 上传文件的便捷方法
   * @param path Path对象
   * @param file_path 文件路径
   * @param file_field_name 文件字段名
   * @param other_data 其他表单数据
   */
  public async uploadFile<T>(
    path: Path,
    file_path: string,
    file_field_name: string,
    other_data?: any
  ): Promise<T> {
    return this.request<T>(path, other_data, {
      file_path,
      file_field_name
    });
  }
}
