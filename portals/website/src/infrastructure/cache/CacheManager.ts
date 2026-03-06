/**
 * CacheManager.ts - 缓存管理器
 *
 * Infrastructure Layer - Cache
 *
 * 职责：
 * - 提供内存缓存功能
 * - 支持 TTL（Time To Live）
 * - 提供缓存清除功能
 *
 * @layer Infrastructure
 * @category Cache
 */

/**
 * 缓存条目
 */
interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
}

/**
 * 缓存管理器配置
 */
export interface CacheManagerConfig {
  readonly ttl: number; // 缓存生存时间（毫秒）
  readonly maxSize?: number; // 最大缓存条目数
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: CacheManagerConfig = {
  ttl: 5 * 60 * 1000, // 5 分钟
  maxSize: 100,
};

/**
 * 缓存管理器
 */
export class CacheManager<T = unknown> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private readonly config: CacheManagerConfig;

  constructor(config: Partial<CacheManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 获取缓存数据
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 设置缓存数据
   */
  set(key: string, data: T): void {
    // 检查缓存大小限制
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 删除指定缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清空匹配前缀的缓存
   */
  clearByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number | undefined;
    ttl: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
    };
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /**
   * 检查缓存条目是否过期
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl;
  }

  /**
   * 驱逐最旧的缓存条目
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

/**
 * 创建缓存管理器实例
 */
export const createCacheManager = <T = unknown>(
  config?: Partial<CacheManagerConfig>
): CacheManager<T> => {
  return new CacheManager<T>(config);
};