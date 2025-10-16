import type {App} from "vue";
import {Config} from "@/Config.ts";
import {UserInfo} from "@/utiles/userInfo.ts";
import { fetch } from '@tauri-apps/plugin-http';
import type { Path } from "@/api/Path.ts";
import {a} from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

export default class HttpClient{
  static create(): any {
    return {
      install: (app: App) => {
        app.provide('$http', new HttpClient())
      }
    }
  };

  static baseURL = Config.baseUrl ? '' : 'http://mgt.crm.dev.pangu.cc/';
  static token: string | undefined = UserInfo.info?.token;

  // 接口URL拼接
  private static fixUrl(path: Path, data?: any): string {
    let url = '';
    let baseUrl = HttpClient.baseURL;

    if (path?.prefix) {
      url = ['/', path.prefix, url].join('');
    }
    let fullUrl = [baseUrl, 'api', url].join('');

    // --- 针对 GET 请求处理查询参数 ---
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
   * @returns Promise，解析为响应数据 (T)。
   */
  public async request<T>(
    path: Path,
    data?: any
  ): Promise<T> {
    const fullUrl = HttpClient.fixUrl(path);

    // --- 请求头和认证逻辑 ---
    let defaultHeaders : any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (HttpClient.token) {
      defaultHeaders['Authorization'] = `Bearer ${HttpClient.token}`;
    } else {
      if (defaultHeaders.Authorization) {
        delete defaultHeaders?.Authorization
      }
    }

    // --- 构建 FetchOptions ---
    const requestOptions = {
      method: path.method,
      headers: defaultHeaders,
      // 只有 POST/PUT 请求才需要设置 Body
      body: (path.method === 'POST' || path.method === 'PUT') && data
        ? JSON.stringify(data)
        : undefined
    };

    return new Promise<T>(async (resolve, reject) => {
      try {
        // 调用 Tauri 插件的 fetch 函数
        const response = await fetch(fullUrl, requestOptions);
        console.info('=====================', response);

        // 检查 HTTP 状态码
        if (response.ok) {
          resolve(response as T)
        } else {

        }

      } catch (error) {
        reject(error);
      }
    })
  }

}
