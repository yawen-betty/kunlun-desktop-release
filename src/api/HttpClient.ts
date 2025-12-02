import type {App} from 'vue';
import {Config} from '@/Config.ts';
import {UserInfo} from '@/utiles/userInfo.ts';
import {invoke} from '@tauri-apps/api/core';
import {listen} from '@tauri-apps/api/event';
import type {Path} from '@/api/Path.ts';
import {message} from '@/utiles/Message.ts';
import {Message} from 'view-ui-plus';

// 定义请求参数接口
interface HttpRequestParams {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    field_name?: string;
    file_name?: string;
    file_bytes?: number[];
    extra_fields?: Record<string, any>;
}

// 定义响应接口
interface HttpResponse {
    status: number;
    headers: Record<string, string>;
    body: any;
}

export interface EmptyOutDto {}

export default class HttpClient {
    static baseURL = Config.baseUrl || 'http://mgt.crm.dev.pangu.cc/';

    // 动态获取token，确保每次请求都使用最新的token
    static get token(): string | undefined {
        return UserInfo.info?.token;
    }

    static create(): any {
        return {
            install: (app: App) => {
                app.provide('$http', new HttpClient());
            }
        };
    }

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
        urlParts.push('kunlun');

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

        // 处理路径参数
        if (data && Object.keys(data).length > 0) {
            const remainingData = {...data};

            // 先处理路径参数 (如 /job-tasks/{uuid})
            fullUrl = fullUrl.replace(/\{([^}]+)\}/g, (match, key) => {
                if (remainingData[key] !== undefined) {
                    const value = remainingData[key];
                    delete remainingData[key]; // 从剩余数据中移除已使用的参数
                    return encodeURIComponent(value);
                }
                return match; // 如果没有对应参数，保持原样
            });

            // GET请求处理剩余的查询参数
            if (path.method === 'GET' && Object.keys(remainingData).length > 0) {
                const params = new URLSearchParams(remainingData).toString();
                fullUrl += fullUrl.includes('?') ? `&${params}` : `?${params}`;
            }
        }
        return fullUrl;
    }

    // 在 HttpClient 类中添加一个私有方法来处理特殊 code
    private static handleSpecialCode(responseBody: any): void {
        // 检查响应体是否包含 code 字段
        if (responseBody && typeof responseBody === 'object' && 'code' in responseBody) {
            const code = responseBody.code;

            switch (code) {
                case 302:
                    message.error(Message, responseBody.msg);
                    UserInfo.logout();
                    break;

                case 2108:
                    message.error(Message, ' 账号已在其他设备登录！');
                    UserInfo.logout();
                    break;

                // 简历数量已达上限
                case 2305:
                    message.error(Message, responseBody.msg);
                    break;

                default:
                    // 其他错误码的通用处理
                    // TODO 白名单
                    if (code !== 200) {
                        console.log(responseBody, 'responseBodyresponseBody');
                        const msg = responseBody.msg || '请求失败';
                        message.error(Message, msg);
                        throw new Error(msg);
                    }
            }
        }
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
            file?: File;
            extraFields?: Record<string, string>;
        }
    ): Promise<T> {
        console.log('开始请求:', path);
        console.log('请求数据:', data);

        // 传递data参数用于构建URL（包括路径参数和查询参数）
        const fullUrl = HttpClient.fixUrl(path, data);
        console.log('构建的URL:', fullUrl);

        // 请求头和认证逻辑
        let defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // version: Config.version
            version: '1.0.0'
        };

        if (HttpClient.token) {
            defaultHeaders['Admin-Token'] = HttpClient.token;
        }

        // 为版本管理接口添加额外的header
        if (/get(Release)?VersionInfo/.test(path.url)) {
            if (data?.type) defaultHeaders['type'] = data.type;
            if (data?.version) defaultHeaders['version'] = data.version;
        }

        console.log('请求头:', defaultHeaders);

        // 构建请求参数
        const requestParams: HttpRequestParams = {
            url: fullUrl,
            method: path.method,
            headers: defaultHeaders
        };

        // 添加请求体 - 判断是文件上传还是普通请求
        if (options?.file) {
            // 文件上传
            const buffer = await options.file.arrayBuffer();
            const fileBytes = Array.from(new Uint8Array(buffer));
            requestParams.field_name = 'file';
            requestParams.file_name = options.file.name;
            requestParams.file_bytes = fileBytes;
            requestParams.extra_fields = options.extraFields;
            delete requestParams.headers?.['Content-Type'];
        } else if (path.method !== 'GET' && data) {
            // 普通 JSON 请求 - 需要过滤掉路径参数
            const bodyData = {...data};
            // 移除URL中已使用的路径参数
            const pathParams = path.url.match(/\{([^}]+)\}/g)?.map((p) => p.slice(1, -1)) || [];
            pathParams.forEach((param) => delete bodyData[param]);

            if (Object.keys(bodyData).length > 0) {
                requestParams.body = bodyData;
                console.log('请求体:', requestParams.body);
            }
        }

        return new Promise<T>(async (resolve, reject) => {
            // try {
            // 调用后端的http_request命令
            const response: HttpResponse = await invoke('http_request', {
                req: requestParams
            });

            console.info('HTTP请求响应:', response);

            // 检查HTTP状态码
            if (response.status >= 200 && response.status < 300) {
                // 返回响应体

                HttpClient.handleSpecialCode(response.body);
                resolve(response.body as T);
            } else {
                reject(new Error(`请求失败: ${response.status} ${JSON.stringify(response.body)}`));
            }
            // } catch (error) {
            //     // 处理特殊业务 code
            //     HttpClient.handleSpecialCode(response.body);
            //     console.error('HTTP请求错误:', error);
            //     reject(error);
            // }
        });
    }

    /**
     * SSE 流式请求方法
     * @param path Path对象
     * @param data 请求体数据
     * @param onMessage 接收到消息时的回调
     * @param onError 发生错误时的回调
     * @param onComplete 完成时的回调
     * @param options formData请求参数
     */
    public async sseRequest(
        path: Path,
        data?: any,
        onMessage?: (data: string) => void,
        onError?: (error: any) => void,
        onComplete?: () => void,
        options?: {
            file?: File;
            extraFields?: Record<string, string>;
        }
    ): Promise<void> {
        const fullUrl = HttpClient.fixUrl(path);
        const eventId = `sse-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            version: Config.version
        };

        if (HttpClient.token) {
            headers['Admin-Token'] = HttpClient.token;
        }

        // 监听消息
        const unlistenMessage = await listen(`sse-message-${eventId}`, (event) => {
            if (onMessage) {
                onMessage(event.payload as string);
            }
        });

        // 监听错误
        const unlistenError = await listen(`sse-error-${eventId}`, (event) => {
            if (onError) {
                onError(event.payload);
            }
            unlistenMessage();
            unlistenError();
            unlistenComplete();
        });

        // 监听完成
        const unlistenComplete = await listen(`sse-complete-${eventId}`, () => {
            if (onComplete) {
                onComplete();
            }
            unlistenMessage();
            unlistenError();
            unlistenComplete();
        });

        // 发起 SSE 请求
        try {
            const params: any = {
                url: fullUrl,
                headers,
                eventId
            };

            // 判断是文件上传还是 JSON
            if (options?.file) {
                const buffer = await options.file.arrayBuffer();
                const fileBytes = Array.from(new Uint8Array(buffer));
                params.fieldName = 'file';
                params.fileName = options.file.name;
                params.fileBytes = fileBytes;
                params.extraFields = options.extraFields;
                delete params.headers['Content-Type'];
            } else {
                params.body = data;
            }

            await invoke('sse_request', params);
        } catch (error) {
            console.error('SSE 请求失败:', error);
            unlistenMessage();
            unlistenError();
            unlistenComplete();
            if (onError) {
                onError(error);
            }
        }
    }
}
