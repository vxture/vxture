/**
 * Layer 4: 数据源 - JSON 文件适配器
 * 职责：从 public/data/ 加载 JSON 文件
 *
 * Week 1 实现方案：从静态 JSON 文件加载
 * Week 3+ 时会添加 API adapter，但此文件保持不变作为降级方案
 */

interface JSONAdapterConfig {
  baseUrl?: string; // 默认: /data
  timeout?: number; // 默认: 5000ms
}

class JSONAdapter {
  private baseUrl: string;
  private timeout: number;

  constructor(config: JSONAdapterConfig = {}) {
    this.baseUrl = config.baseUrl || '/data';
    this.timeout = config.timeout || 5000;
  }

  /**
   * 从 JSON 文件获取内容
   * @param key 文件关键字 (hero, features 等)
   * @param locale 语言 (zh-CN, en-US)
   * @returns Promise<ContentData>
   */
  async fetch(key: string, locale: string): Promise<unknown> {
    const url = `${this.baseUrl}/${key}.${locale}.json`;

    try {
      const response = await this.fetchWithTimeout(url, this.timeout);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${url} (${response.status} ${response.statusText})`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`JSON Adapter Error [${key}.${locale}]: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 带超时的 fetch 请求
   */
  private fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    return Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error(`Fetch timeout: ${url} (${timeoutMs}ms)`)), timeoutMs)
      ),
    ]);
  }

  /**
   * 获取文件 URL（用于调试）
   */
  getUrl(key: string, locale: string): string {
    return `${this.baseUrl}/${key}.${locale}.json`;
  }
}

// 导出单例
export const jsonAdapter = new JSONAdapter();
