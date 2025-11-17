import { invoke } from '@tauri-apps/api/core';

/**
 * 认证相关的 Tauri 命令封装
 */
export const auth = {
  /**
   * 保存认证令牌
   * @param token 用户认证令牌
   * @returns 保存的令牌
   */
  saveToken: async (token: string): Promise<string> => {
    try {
      // 调用 Rust 端的 save_token 命令，app_handle 由 Tauri 框架自动注入
      return await invoke('save_token', { token });
    } catch (error) {
      console.error('保存 token 失败:', error);
      throw error;
    }
  },

  /**
   * 获取保存的认证令牌
   * @returns 认证令牌，如果不存在则返回 "no token"
   */
  getToken: async (): Promise<string> => {
    try {
      // 调用 Rust 端的 get_token 命令，app_handle 由 Tauri 框架自动注入
      return await invoke('get_token');
    } catch (error) {
      console.error('获取 token 失败:', error);
      throw error;
    }
  }
};


/**
 * 图片处理相关的 Tauri 命令封装
 */
export const image = {
  /**
   * 将服务器图片URL转换为Base64 Data URL
   * @param url 图片URL（支持http/https）
   * @returns Base64 Data URL字符串，格式：data:image/xxx;base64,xxx
   * @example
   * const base64 = await image.toBase64('https://example.com/image.png');
   * // 直接用于img标签: <img :src="base64" />
   */
  toBase64: async (url: string): Promise<string> => {
    try {
      return await invoke('image_to_base64', { url });
    } catch (error) {
      console.error('图片转Base64失败:', error);
      throw error;
    }
  }
};
