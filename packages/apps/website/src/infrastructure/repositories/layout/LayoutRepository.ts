/**
 * LayoutRepository.ts - Layout 聚合仓储实现
 *
 * Infrastructure Layer - Repositories
 *
 * 职责：
 * - 实现 ILayoutRepository 接口
 * - 聚合 Header 和 Footer 的数据获取
 *
 * @layer Infrastructure
 * @category Repositories
 */

import type { ILayoutRepository } from '@/domain/layout/layout.repository';
import type { HeaderContent } from '@/domain/layout/header.model';
import type { FooterContent } from '@/domain/layout/footer.model';

import { JsonAdapter } from '../../adapters/json/JsonAdapter';
import { CacheManager } from '../../cache/CacheManager';
import { HeaderMapper } from '../../mappers/layout/HeaderMapper';
import { FooterMapper } from '../../mappers/layout/FooterMapper';
import { createContentNotFoundError } from '@/domain/shared/exceptions';

/**
 * Layout 仓储实现
 */
export class LayoutRepository implements ILayoutRepository {
  private readonly adapter: JsonAdapter;
  private readonly cache: CacheManager<unknown>;

  constructor(adapter: JsonAdapter, cache: CacheManager<unknown>) {
    this.adapter = adapter;
    this.cache = cache;
  }

  /**
   * 获取完整的 Layout 数据
   */
  async getLayout(locale: string): Promise<{
    header: HeaderContent;
    footer: FooterContent;
  }> {
    const [header, footer] = await Promise.all([
      this.getHeader(locale),
      this.getFooter(locale),
    ]);

    return { header, footer };
  }

  /**
   * 获取 Header
   */
  async getHeader(locale: string): Promise<HeaderContent> {
    return this.fetchContent('header', locale, HeaderMapper.toDomain);
  }

  /**
   * 获取 Footer
   */
  async getFooter(locale: string): Promise<FooterContent> {
    return this.fetchContent('footer', locale, FooterMapper.toDomain);
  }

  /**
   * 清除缓存
   */
  clearCache(locale?: string): void {
    if (locale) {
      this.cache.delete(`header:${locale}`);
      this.cache.delete(`footer:${locale}`);
    } else {
      this.cache.clearByPrefix('header:');
      this.cache.clearByPrefix('footer:');
    }
  }

  /**
   * 通用的内容获取方法
   */
  private async fetchContent<T>(
    key: string,
    locale: string,
    mapper: (raw: unknown) => T
  ): Promise<T> {
    const cacheKey = `${key}:${locale}`;

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    try {
      // 从 JSON 获取数据
      const raw = await this.adapter.fetch(key, locale);

      // 映射为领域模型
      const domain = mapper(raw);

      // 缓存结果
      this.cache.set(cacheKey, domain);

      return domain;
    } catch {
      throw createContentNotFoundError(key, locale);
    }
  }
}

/**
 * 创建 LayoutRepository 实例
 */
export const createLayoutRepository = (
  adapter: JsonAdapter,
  cache: CacheManager<unknown>
): LayoutRepository => {
  return new LayoutRepository(adapter, cache);
};