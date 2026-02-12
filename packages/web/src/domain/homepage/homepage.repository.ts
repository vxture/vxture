/**
 * homepage.repository.ts - Homepage 仓储接口
 *
 * Domain Layer - Homepage Domain
 *
 * 职责：
 * - 定义 Homepage 领域的数据访问契约
 * - 提供首页所有区块的数据获取接口
 * - 由 Infrastructure Layer 实现
 *
 * @layer Domain
 * @category Homepage
 */

import type { HomepageAggregate } from './homepage.aggregate';
import type { HeroContent } from './hero.model';
import type { FeaturesContent } from './features.model';
import type { SolutionsContent } from './solutions.model';
import type { CasesContent } from './cases.model';
import type { CTAContent } from './cta.model';
import type { IContentRepository } from '../shared/repositories';

/**
 * Hero 仓储接口
 */
export interface IHeroRepository extends IContentRepository<HeroContent> {
  getByLocale(locale: string): Promise<HeroContent>;
}

/**
 * Features 仓储接口
 */
export interface IFeaturesRepository extends IContentRepository<FeaturesContent> {
  getByLocale(locale: string): Promise<FeaturesContent>;
}

/**
 * Solutions 仓储接口
 */
export interface ISolutionsRepository extends IContentRepository<SolutionsContent> {
  getByLocale(locale: string): Promise<SolutionsContent>;
}

/**
 * Cases 仓储接口
 */
export interface ICasesRepository extends IContentRepository<CasesContent> {
  getByLocale(locale: string): Promise<CasesContent>;
}

/**
 * CTA 仓储接口
 */
export interface ICTARepository extends IContentRepository<CTAContent> {
  getByLocale(locale: string): Promise<CTAContent>;
}

/**
 * Homepage 仓储接口（聚合所有区块）
 */
export interface IHomepageRepository {
  /**
   * 获取完整的首页数据（聚合根）
   */
  getHomepage(locale: string): Promise<HomepageAggregate>;

  /**
   * 获取 Hero 区块
   */
  getHero(locale: string): Promise<HeroContent>;

  /**
   * 获取 Features 区块
   */
  getFeatures(locale: string): Promise<FeaturesContent>;

  /**
   * 获取 Solutions 区块
   */
  getSolutions(locale: string): Promise<SolutionsContent>;

  /**
   * 获取 Cases 区块
   */
  getCases(locale: string): Promise<CasesContent>;

  /**
   * 获取 CTA 区块
   */
  getCTA(locale: string): Promise<CTAContent>;

  /**
   * 批量获取指定的区块
   */
  getSections(
    sections: Array<'hero' | 'features' | 'solutions' | 'cases' | 'cta'>,
    locale: string
  ): Promise<Partial<HomepageAggregate>>;

  /**
   * 清除缓存
   */
  clearCache(locale?: string): void;
}