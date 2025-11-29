import { invoke } from '@tauri-apps/api/core';

/**
 * 渠道认证管理
 * 
 * 用于管理多个渠道的认证信息（Cookies）
 */
export const channelAuth = {
  /**
   * 保存指定渠道的 Cookies
   * 
   * @param channelName 渠道名称（如 "boss", "zhipin", "linkedin"）
   * @param cookies Cookie 字符串
   * @returns Promise<void>
   * 
   * @example
   * await channelAuth.saveCookies('boss', 'sessionid=xxx; token=yyy');
   */
  saveCookies: async (channelName: string, cookies: string): Promise<void> => {
    try {
      await invoke('save_channel_cookies', {
        channelName: channelName,
        cookies: cookies
      });
    } catch (error) {
      console.error(`保存 ${channelName} 渠道 Cookies 失败:`, error);
      throw error;
    }
  },

  /**
   * 获取指定渠道的 Cookies
   * 
   * @param channelName 渠道名称
   * @returns Cookie 字符串，如果不存在则返回 "no cookies"
   * 
   * @example
   * const cookies = await channelAuth.getCookies('boss');
   * if (cookies !== 'no cookies') {
   *   console.log('Boss Cookies:', cookies);
   * }
   */
  getCookies: async (channelName: string): Promise<string> => {
    try {
      return await invoke('get_channel_cookies', {
        channelName: channelName
      });
    } catch (error) {
      console.error(`获取 ${channelName} 渠道 Cookies 失败:`, error);
      throw error;
    }
  },

  /**
   * 获取所有渠道的 Cookies
   * 
   * @returns 所有渠道的 Cookies Map
   * 
   * @example
   * const allCookies = await channelAuth.getAllCookies();
   * console.log(allCookies);
   * // { "boss": "...", "zhipin": "...", "linkedin": "..." }
   */
  getAllCookies: async (): Promise<Record<string, string>> => {
    try {
      const result = await invoke<string>('get_channel_cookies', {
        channelName: undefined
      });
      return JSON.parse(result);
    } catch (error) {
      console.error('获取所有渠道 Cookies 失败:', error);
      throw error;
    }
  }
};
