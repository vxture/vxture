/**
 * CasesRepository.ts - Cases 仓储实现
 *
 * Infrastructure Layer - Repositories
 *
 * 职责：
 * - 实现 ICasesRepository 接口
 * - 使用 JsonAdapter 获取数据
 * - 使用 CasesMapper 转换数据
 * - 提供缓存功能
 *
 * @layer Infrastructure
 * @category Repositories
 */

import type { ICasesRepository } from '@/domain/homepage/homepage.repository';
import type { CasesContent } from '@/domain/homepage/cases.model';
import { JsonAdapter } from '../../adapters/json/JsonAdapter';
import { CacheManager } from '../../cache/CacheManager';
import { CasesMapper } from '../../mappers/homepage/CasesMapper';
import type { CasesContentRaw } from '../../mappers/homepage/CasesMapper';
import { createContentNotFoundError } from '@/domain/shared/exceptions';

/**
 * Cases 仓储实现
 */
export class CasesRepository implements ICasesRepository {
  private readonly adapter: JsonAdapter;
  private readonly cache: CacheManager<CasesContent>;

  constructor(adapter: JsonAdapter, cache: CacheManager<CasesContent>) {
    this.adapter = adapter;
    this.cache = cache;
  }

  /**
   * 根据语言获取 Cases 内容
   */
  async getByLocale(locale: string): Promise<CasesContent> {
    const cacheKey = `cases:${locale}`;

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // 从 JSON 获取数据
      const raw = await this.adapter.fetch('cases', locale);

      // 映射为领域模型
      const domain = CasesMapper.toDomain(raw as CasesContentRaw);

      // 缓存结果
      this.cache.set(cacheKey, domain);

      return domain;
    } catch (_) {
      throw createContentNotFoundError('cases', locale);
    }
  }

  /**
   * 批量获取多个语言的内容
   */
  async getBatchByLocales(locales: string[]): Promise<Map<string, CasesContent>> {
    const results = await Promise.all(
      locales.map(async locale => {
        const content = await this.getByLocale(locale);
        return [locale, content] as const;
      })
    );

    return new Map(results);
  }

  /**
   * 检查内容是否存在
   */
  async exists(locale: string): Promise<boolean> {
    try {
      await this.getByLocale(locale);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 清除缓存
   */
  clearCache(locale?: string): void {
    if (locale) {
      this.cache.delete(`cases:${locale}`);
    } else {
      this.cache.clearByPrefix('cases:');
    }
  }
}

/**
 * 创建 CasesRepository 实例
 */
export const createCasesRepository = (
  adapter: JsonAdapter,
  cache: CacheManager<CasesContent>
): CasesRepository => {
  return new CasesRepository(adapter, cache);
};