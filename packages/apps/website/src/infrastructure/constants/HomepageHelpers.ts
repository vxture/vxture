/**
 * HomepageHelpers.ts - Homepage sections 数据规范化工具
 *
 * 功能：
 * 1. 将传入的数据与默认值合并，保证所有必填字段都有值
 * 2. 避免前端直接操作 undefined 或缺失属性
 * 3. 确保 debugLog 能输出有意义的调试信息
 */

import type { HeroContent } from '@/domain/homepage/hero.model';
import type { FeaturesContent } from '@/domain/homepage/features.model';
import type { SolutionsContent } from '@/domain/homepage/solutions.model';
import type { CasesContent } from '@/domain/homepage/cases.model';
import type { CTAContent } from '@/domain/homepage/cta.model';
import {
  FALLBACK_HERO,
  FALLBACK_FEATURES,
  FALLBACK_SOLUTIONS,
  FALLBACK_CASES,
  FALLBACK_CTA,
} from './HomepageDefaults';

/**
 * normalizeHeroData
 * -------------------
 * 将传入的 Hero 数据和默认值合并
 */
export function normalizeHeroData(hero?: Partial<HeroContent>): HeroContent {
  return {
    ...FALLBACK_HERO,
    ...hero,
    cta: { ...FALLBACK_HERO.cta, ...hero?.cta },
    media: { ...FALLBACK_HERO.media, ...hero?.media },
    scrollIndicator: hero?.scrollIndicator ?? FALLBACK_HERO.scrollIndicator,
  };
}

/**
 * normalizeFeaturesData
 * -------------------
 * 将传入的 Features 数据和默认值合并
 */
export function normalizeFeaturesData(features?: Partial<FeaturesContent>): FeaturesContent {
  return {
    ...FALLBACK_FEATURES,
    ...features,
    items: features?.items ?? FALLBACK_FEATURES.items,
  };
}

/**
 * normalizeSolutionsData
 * -------------------
 * 将传入的 Solutions 数据和默认值合并
 */
export function normalizeSolutionsData(solutions?: Partial<SolutionsContent>): SolutionsContent {
  return {
    ...FALLBACK_SOLUTIONS,
    ...solutions,
    items: solutions?.items ?? FALLBACK_SOLUTIONS.items,
  };
}

/**
 * normalizeCasesData
 * -------------------
 * 将传入的 Cases 数据和默认值合并
 */
export function normalizeCasesData(cases?: Partial<CasesContent>): CasesContent {
  return {
    ...FALLBACK_CASES,
    ...cases,
    items: cases?.items ?? FALLBACK_CASES.items,
  };
}

/**
 * normalizeCTAData
 * -------------------
 * 将传入的 CTA 数据和默认值合并
 */
export function normalizeCTAData(cta?: Partial<CTAContent>): CTAContent {
  return {
    ...FALLBACK_CTA,
    ...cta,
    actions: cta?.actions ?? FALLBACK_CTA.actions,
  };
}
