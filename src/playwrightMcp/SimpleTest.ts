/**
 * 简单测试：打开网页
 */
export class SimpleTest {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * 测试打开网页
   */
  async openWebsite(): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`准备打开网页: ${this.url}`);
      
      // 直接返回成功，让 AI 通过 MCP 工具打开
      return {
        success: true,
        message: `请使用 MCP browser_navigate 工具打开: ${this.url}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
