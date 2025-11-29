import { Store } from '@tauri-apps/plugin-store';

export interface AIConfig {
  provider: 'openai' | 'ollama' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

const store = new Store('ai-config.json');

/**
 * AI 配置管理
 */
export class AIConfigManager {
  /**
   * 保存配置
   */
  static async saveConfig(config: AIConfig) {
    await store.set('ai_config', config);
    await store.save();
  }

  /**
   * 获取配置
   */
  static async getConfig(): Promise<AIConfig | null> {
    return await store.get<AIConfig>('ai_config');
  }

  /**
   * 获取默认配置
   */
  static getDefaultConfig(): AIConfig {
    return {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'qwen2.5:7b'
    };
  }
}
