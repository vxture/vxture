/**
 * Layer 3: 内容访问层 - 统一的内容获取接口
 * 职责：屏蔽数据源差异，提供缓存和错误处理
 *
 * 支持的数据源：
 * - Week 1: JSON 文件 (public/data/*.json)
 * - Week 3+: API 端点 (/api/content/*)
 * - Week 4+: Strapi CMS
 */

import { jsonAdapter } from './adapters/jsonAdapter';
import type { ContentKey, ContentTypeMap } from '@/types/content.types';

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ContentClient {
  private cache = new Map<string, CacheEntry>();

  /**
   * 获取内容（自动选择数据源和处理缓存）- 类型安全版本
   * @param key 内容关键字 (hero, features, products, cases, cta 等)
   * @param locale 语言 (zh-CN, en-US)
   * @returns Promise<ContentData>
   */
  async getContent<K extends ContentKey>(
    key: K,
    locale: string
  ): Promise<ContentTypeMap[K]>;

  /**
   * 获取内容（自动选择数据源和处理缓存）- 通用版本
   * @param key 内容关键字
   * @param locale 语言
   * @returns Promise<unknown>
   */
  async getContent(key: string, locale: string): Promise<unknown>;

  /**
   * 实现
   */
  async getContent(key: string, locale: string): Promise<unknown> {
    const cacheKey = `${key}:${locale}`;

    // 1. 检查内存缓存
    const cached = this.getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 2. 尝试数据源（当前 Week 1: 仅 JSON）
    try {
      // Week 3+ 时，这里可以添加 apiAdapter 优先级
      // const data = await apiAdapter.fetch(key, locale)

      // Week 1: 使用 JSON adapter
      const data = await jsonAdapter.fetch(key, locale);

      // 缓存结果
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      // 未来可在这里添加降级逻辑
      console.error(`Failed to load content: ${key}.${locale}`, error);
      throw error;
    }
  }

  /**
   * 获取缓存的数据（考虑 TTL）
   */
  private getCached(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清空所有缓存（用于测试或手动刷新）
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清空特定缓存
   */
  clearCacheFor(key: string, locale?: string): void {
    if (locale) {
      this.cache.delete(`${key}:${locale}`);
    } else {
      // 清空 key 对应的所有语言版本
      for (const cacheKey of this.cache.keys()) {
        if (cacheKey.startsWith(`${key}:`)) {
          this.cache.delete(cacheKey);
        }
      }
    }
  }
}

// 导出单例
export const contentClient = new ContentClient();
