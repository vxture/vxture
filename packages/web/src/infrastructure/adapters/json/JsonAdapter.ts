/**
 * JsonAdapter.ts - JSON 文件适配器
 *
 * Infrastructure Layer - Adapters
 *
 * 职责：
 * - 从 public/data/ 目录读取 JSON 文件
 * - 提供统一的文件读取接口
 * - 处理文件路径映射
 *
 * @layer Infrastructure
 * @category Adapters
 */

/**
 * JSON 适配器配置
 */
export interface JsonAdapterConfig {
  readonly baseUrl: string;
  readonly timeout: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: JsonAdapterConfig = {
  baseUrl: '/data',
  timeout: 5000,
};

/**
 * 内容类型到子目录的映射
 */
const PATH_MAP: Record<string, string> = {
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

/**
 * JSON 适配器
 */
export class JsonAdapter {
  private readonly config: JsonAdapterConfig;

  constructor(config: Partial<JsonAdapterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 从 JSON 文件获取数据
   */
  async fetch<T = unknown>(key: string, locale: string): Promise<T> {
    const url = this.buildUrl(key, locale);

    try {
      const response = await this.fetchWithTimeout(url, this.config.timeout);

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

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`JSON Adapter Error [${key}.${locale}]: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 构建文件 URL
   */
  private buildUrl(key: string, locale: string): string {
    const subdir = PATH_MAP[key];

    if (subdir) {
      // 对于 header/footer，路径是 layout/{key}/{key}.locale.json
      // 对于 sections，路径是 pages/home/sections/{key}.locale.json
      if (key === 'header' || key === 'footer') {
        return `${this.config.baseUrl}/${subdir}/${key}/${key}.${locale}.json`;
      } else {
        return `${this.config.baseUrl}/${subdir}/${key}.${locale}.json`;
      }
    }

    // 如果没有映射，回退到根目录
    console.warn(`No path mapping for content key: ${key}, using root directory`);
    return `${this.config.baseUrl}/${key}.${locale}.json`;
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

/**
 * 创建 JSON 适配器实例
 */
export const createJsonAdapter = (config?: Partial<JsonAdapterConfig>): JsonAdapter => {
  return new JsonAdapter(config);
};

/**
 * 默认 JSON 适配器实例
 */
export const jsonAdapter = createJsonAdapter();
