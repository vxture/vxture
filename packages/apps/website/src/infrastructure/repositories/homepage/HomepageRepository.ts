/**
 * HomepageRepository.ts - Homepage 聚合仓储实现
 *
 * Infrastructure Layer - Repositories
 *
 * 职责：
 * - 实现 IHomepageRepository 接口
 * - 聚合所有 Homepage 区块的数据获取
 * - 提供统一的首页数据访问接口
 *
 * @layer Infrastructure
 * @category Repositories
 */

import type { IHomepageRepository } from '@/domain/homepage/homepage.repository';
import type { HomepageAggregate } from '@/domain/homepage/homepage.aggregate';
import type { HeroContent } from '@/domain/homepage/hero.model';
import type { FeaturesContent } from '@/domain/homepage/features.model';
import type { SolutionsContent } from '@/domain/homepage/solutions.model';
import type { CasesContent } from '@/domain/homepage/cases.model';
import type { CTAContent } from '@/domain/homepage/cta.model';

import { JsonAdapter } from '../../adapters/json/JsonAdapter';
import { CacheManager } from '../../cache/CacheManager';
import { HeroMapper } from '../../mappers/homepage/HeroMapper';
import { FeaturesMapper } from '../../mappers/homepage/FeaturesMapper';
import { SolutionsMapper } from '../../mappers/homepage/SolutionsMapper';
import { CasesMapper } from '../../mappers/homepage/CasesMapper';
import { CTAMapper } from '../../mappers/homepage/CTAMapper';
import { createContentNotFoundError } from '@/domain/shared/exceptions';

/**
 * Homepage 仓储实现
 */
export class HomepageRepository implements IHomepageRepository {
  private readonly adapter: JsonAdapter;
  private readonly cache: CacheManager<unknown>;

  constructor(adapter: JsonAdapter, cache: CacheManager<unknown>) {
    this.adapter = adapter;
    this.cache = cache;
  }

  /**
   * 获取完整的首页数据（聚合根）
   */
  async getHomepage(locale: string): Promise<HomepageAggregate> {
    const [hero, features, solutions, cases, cta] = await Promise.all([
      this.getHero(locale),
      this.getFeatures(locale),
      this.getSolutions(locale),
      this.getCases(locale),
      this.getCTA(locale),
    ]);

    return {
      hero,
      features,
      solutions,
      cases,
      cta,
    };
  }

  /**
   * 获取 Hero 区块
   */
  async getHero(locale: string): Promise<HeroContent> {
    return this.fetchContent('hero', locale, HeroMapper.toDomain);
  }

  /**
   * 获取 Features 区块
   */
  async getFeatures(locale: string): Promise<FeaturesContent> {
    return this.fetchContent('features', locale, FeaturesMapper.toDomain);
  }

  /**
   * 获取 Solutions 区块
   */
  async getSolutions(locale: string): Promise<SolutionsContent> {
    return this.fetchContent('solutions', locale, SolutionsMapper.toDomain);
  }

  /**
   * 获取 Cases 区块
   */
  async getCases(locale: string): Promise<CasesContent> {
    return this.fetchContent('cases', locale, CasesMapper.toDomain);
  }

  /**
   * 获取 CTA 区块
   */
  async getCTA(locale: string): Promise<CTAContent> {
    return this.fetchContent('cta', locale, CTAMapper.toDomain);
  }

  /**
   * 批量获取指定的区块
   */
  async getSections(
    sections: Array<'hero' | 'features' | 'solutions' | 'cases' | 'cta'>,
    locale: string
  ): Promise<Partial<HomepageAggregate>> {
    const result: Partial<HomepageAggregate> = {};

    await Promise.all(
      sections.map(async section => {
        switch (section) {
          case 'hero':
            result.hero = await this.getHero(locale);
            break;
          case 'features':
            result.features = await this.getFeatures(locale);
            break;
          case 'solutions':
            result.solutions = await this.getSolutions(locale);
            break;
          case 'cases':
            result.cases = await this.getCases(locale);
            break;
          case 'cta':
            result.cta = await this.getCTA(locale);
            break;
        }
      })
    );

    return result;
  }

  /**
   * 清除缓存
   */
  clearCache(locale?: string): void {
    if (locale) {
      this.cache.clearByPrefix(`hero:${locale}`);
      this.cache.clearByPrefix(`features:${locale}`);
      this.cache.clearByPrefix(`solutions:${locale}`);
      this.cache.clearByPrefix(`cases:${locale}`);
      this.cache.clearByPrefix(`cta:${locale}`);
    } else {
      this.cache.clear();
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
 * 创建 HomepageRepository 实例
 */
export const createHomepageRepository = (
  adapter: JsonAdapter,
  cache: CacheManager<unknown>
): HomepageRepository => {
  return new HomepageRepository(adapter, cache);
};