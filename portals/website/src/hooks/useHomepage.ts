/**
 * 首页相关 Hooks
 * @package @vxture/website
 * @layer Presentation
 * @category Hooks
 */

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import {
  HeroData,
  FeaturesData,
  CasesData,
  CTAData,
  SolutionsData,
} from '@/types/homepage.types';
import {
  FALLBACK_HERO_DATA,
  FALLBACK_FEATURES_DATA,
  FALLBACK_CASES_DATA,
  FALLBACK_CTA_DATA,
  FALLBACK_SOLUTIONS_DATA,
} from '@/fallback/homepage.fallback';

// 导入翻译文件 - zh-CN
import zhCNHero from '@/../messages/zh-CN/home/hero.json';
import zhCNFeatures from '@/../messages/zh-CN/home/features.json';
import zhCNCases from '@/../messages/zh-CN/home/cases.json';
import zhCNCTA from '@/../messages/zh-CN/home/cta.json';
import zhCNSolutions from '@/../messages/zh-CN/home/solutions.json';

// 导入翻译文件 - en-US
import enUSHero from '@/../messages/en-US/home/hero.json';
import enUSFeatures from '@/../messages/en-US/home/features.json';
import enUSCases from '@/../messages/en-US/home/cases.json';
import enUSCTA from '@/../messages/en-US/home/cta.json';
import enUSSolutions from '@/../messages/en-US/home/solutions.json';

// 翻译数据映射
const heroTranslations: Record<string, HeroData> = {
  'zh-CN': zhCNHero as HeroData,
  'en-US': enUSHero as HeroData
};

const featuresTranslations: Record<string, FeaturesData> = {
  'zh-CN': zhCNFeatures as FeaturesData,
  'en-US': enUSFeatures as FeaturesData
};

const casesTranslations: Record<string, CasesData> = {
  'zh-CN': zhCNCases as CasesData,
  'en-US': enUSCases as CasesData
};

const ctaTranslations: Record<string, CTAData> = {
  'zh-CN': zhCNCTA as CTAData,
  'en-US': enUSCTA as CTAData
};

const solutionsTranslations: Record<string, SolutionsData> = {
  'zh-CN': zhCNSolutions as SolutionsData,
  'en-US': enUSSolutions as SolutionsData
};

// ============================================================================
// 数据规范化函数
// ============================================================================

/**
 * 规范化 Hero 数据
 */
function normalizeHeroData(data?: Partial<HeroData>): HeroData {
  if (!data) return FALLBACK_HERO_DATA;
  return {
    ...FALLBACK_HERO_DATA,
    ...data,
    media: data?.media
      ? { ...FALLBACK_HERO_DATA.media, ...data.media }
      : FALLBACK_HERO_DATA.media,
    cta: data?.cta
      ? { ...FALLBACK_HERO_DATA.cta, ...data.cta }
      : FALLBACK_HERO_DATA.cta,
    scrollIndicator: data?.scrollIndicator
      ? { ...FALLBACK_HERO_DATA.scrollIndicator, ...data.scrollIndicator }
      : FALLBACK_HERO_DATA.scrollIndicator,
  };
}

/**
 * 规范化 Features 数据
 */
function normalizeFeaturesData(data?: Partial<FeaturesData>): FeaturesData {
  if (!data) return FALLBACK_FEATURES_DATA;
  return {
    ...FALLBACK_FEATURES_DATA,
    ...data,
  };
}

/**
 * 规范化 Cases 数据
 */
function normalizeCasesData(data?: Partial<CasesData>): CasesData {
  if (!data) return FALLBACK_CASES_DATA;
  return {
    ...FALLBACK_CASES_DATA,
    ...data,
    ui: data?.ui
      ? { ...FALLBACK_CASES_DATA.ui, ...data.ui }
      : FALLBACK_CASES_DATA.ui,
  };
}

/**
 * 规范化 CTA 数据
 */
function normalizeCTAData(data?: Partial<CTAData>): CTAData {
  if (!data) return FALLBACK_CTA_DATA;
  return {
    ...FALLBACK_CTA_DATA,
    ...data,
  };
}

/**
 * 规范化 Solutions 数据
 */
function normalizeSolutionsData(data?: Partial<SolutionsData>): SolutionsData {
  if (!data) return FALLBACK_SOLUTIONS_DATA;
  return {
    ...FALLBACK_SOLUTIONS_DATA,
    ...data,
    ui: data?.ui
      ? { ...FALLBACK_SOLUTIONS_DATA.ui, ...data.ui }
      : FALLBACK_SOLUTIONS_DATA.ui,
  };
}

// ============================================================================
// Hero 数据 Hook
// ============================================================================

export function useHero(): {
  data: HeroData;
  isLoading: boolean;
  error: Error | null;
} {
  const locale = useLocale();

  const data = useMemo(() => {
    const heroData = heroTranslations[locale] || heroTranslations['en-US'];
    return normalizeHeroData(heroData);
  }, [locale]);

  return { data, isLoading: false, error: null };
}

// ============================================================================
// Features 数据 Hook
// ============================================================================

export function useFeatures(): {
  data: FeaturesData;
  isLoading: boolean;
  error: Error | null;
} {
  const locale = useLocale();

  const data = useMemo(() => {
    const featuresData = featuresTranslations[locale] || featuresTranslations['en-US'];
    return normalizeFeaturesData(featuresData);
  }, [locale]);

  return { data, isLoading: false, error: null };
}

// ============================================================================
// Cases 数据 Hook
// ============================================================================

export function useCasesData(): {
  data: CasesData;
  isLoading: boolean;
  error: Error | null;
} {
  const locale = useLocale();

  const data = useMemo(() => {
    const casesData = casesTranslations[locale] || casesTranslations['en-US'];
    return normalizeCasesData(casesData);
  }, [locale]);

  return { data, isLoading: false, error: null };
}

// ============================================================================
// CTA 数据 Hook
// ============================================================================

export function useCTA(): {
  data: CTAData;
  isLoading: boolean;
  error: Error | null;
} {
  const locale = useLocale();

  const data = useMemo(() => {
    const ctaData = ctaTranslations[locale] || ctaTranslations['en-US'];
    return normalizeCTAData(ctaData);
  }, [locale]);

  return { data, isLoading: false, error: null };
}

// ============================================================================
// Solutions 数据 Hook
// ============================================================================

export function useSolutions(): {
  data: SolutionsData;
  isLoading: boolean;
  error: Error | null;
} {
  const locale = useLocale();

  const data = useMemo(() => {
    const solutionsData = solutionsTranslations[locale] || solutionsTranslations['en-US'];
    return normalizeSolutionsData(solutionsData);
  }, [locale]);

  return { data, isLoading: false, error: null };
}

// ============================================================================
// 组合 Hook：获取所有首页数据
// ============================================================================

export function useHomepage(): {
  hero: ReturnType<typeof useHero>;
  features: ReturnType<typeof useFeatures>;
  cases: ReturnType<typeof useCasesData>;
  cta: ReturnType<typeof useCTA>;
  solutions: ReturnType<typeof useSolutions>;
} {
  return {
    hero: useHero(),
    features: useFeatures(),
    cases: useCasesData(),
    cta: useCTA(),
    solutions: useSolutions(),
  };
}
