/**
 * Layer 4: 数据源 - JSON 文件适配器
 * 职责：从 public/data/ 加载 JSON 文件
 *
 * Week 1 实现方案：从静态 JSON 文件加载
 * Week 3+ 时会添加 API adapter，但此文件保持不变作为降级方案
 *
 * 支持的目录结构：
 * - /data/layout/{key}.{locale}.json (header, footer)
 * - /data/sections/{key}.{locale}.json (hero, features, solutions, cases, cta)
 */

interface JSONAdapterConfig {
  baseUrl?: string; // 默认: /data
  timeout?: number; // 默认: 5000ms
}

class JSONAdapter {
  private baseUrl: string;
  private timeout: number;

  // 内容类型到子目录的映射
  private readonly pathMap: Record<string, string> = {
    // Layout 布局组件
    header: 'layout',
    footer: 'layout',

    // Pages/Home/Sections 首页区块
    hero: 'pages/home/sections',
    features: 'pages/home/sections',
    solutions: 'pages/home/sections',
    cases: 'pages/home/sections',
    cta: 'pages/home/sections',
  };

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
    const url = this.buildUrl(key, locale);

    try {
      const response = await this.fetchWithTimeout(url, this.timeout);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${url} (${response.status} ${response.statusText})`);
      }

      const data = await response.json();

      // 验证返回的数据是否包含预期的 key
      if (typeof data === 'object' && data !== null && 'key' in data) {
        if (data.key !== key) {
          console.warn(`Content key mismatch: expected "${key}", got "${data.key}"`);
        }
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`JSON Adapter Error [${key}.${locale}]: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 构建文件 URL（根据内容类型自动选择子目录）
   */
  private buildUrl(key: string, locale: string): string {
    const subdir = this.pathMap[key];

    if (subdir) {
      // 对于 header/footer，路径是 layout/{key}/{key}.locale.json
      // 对于 sections，路径是 pages/home/sections/{key}.locale.json
      if (key === 'header' || key === 'footer') {
        return `${this.baseUrl}/${subdir}/${key}/${key}.${locale}.json`;
      } else {
        return `${this.baseUrl}/${subdir}/${key}.${locale}.json`;
      }
    }

    // 如果没有映射，回退到根目录
    console.warn(`No path mapping for content key: ${key}, using root directory`);
    return `${this.baseUrl}/${key}.${locale}.json`;
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
    return this.buildUrl(key, locale);
  }
}

// 导出单例
export const jsonAdapter = new JSONAdapter();
