/**
 * 首页相关 Hooks
 * @package @vxture/website
 * @layer Presentation
 * @category Hooks
 */

import { useCallback, useEffect, useState } from 'react';
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

// ============================================================================
// 数据规范化函数
// ============================================================================

/**
 * 规范化 Hero 数据
 */
function normalizeHeroData(data?: Partial<HeroData>): HeroData {
  return {
    enabled: data?.enabled ?? true,
    title: data?.title ?? '智能平台',
    titleHighlight: data?.titleHighlight,
    description: data?.description,
    media: {
      type: data?.media?.type ?? 'none',
      videoUrl: data?.media?.videoUrl,
      posterImage: data?.media?.posterImage,
      url: data?.media?.url,
      alt: data?.media?.alt,
    },
    cta: data?.cta,
    scrollIndicator: data?.scrollIndicator,
  };
}

/**
 * 规范化 Features 数据
 */
function normalizeFeaturesData(data?: Partial<FeaturesData>): FeaturesData {
  return {
    enabled: data?.enabled ?? true,
    title: data?.title ?? '核心功能',
    subtitle: data?.subtitle,
    tagline: data?.tagline,
    items: data?.items ?? [],
  };
}

/**
 * 规范化 Cases 数据
 */
function normalizeCasesData(data?: Partial<CasesData>): CasesData {
  return {
    enabled: data?.enabled ?? true,
    title: data?.title ?? '成功案例',
    subtitle: data?.subtitle,
    tagline: data?.tagline,
    items: data?.items ?? [],
    ui: {
      viewDetails: data?.ui?.viewDetails ?? '查看详情',
    },
  };
}

/**
 * 规范化 CTA 数据
 */
function normalizeCTAData(data?: Partial<CTAData>): CTAData {
  return {
    enabled: data?.enabled ?? true,
    title: data?.title ?? '准备好开始了吗？',
    subtitle: data?.subtitle,
    actions: data?.actions ?? [],
    contact: data?.contact,
  };
}

/**
 * 规范化 Solutions 数据
 */
function normalizeSolutionsData(data?: Partial<SolutionsData>): SolutionsData {
  return {
    enabled: data?.enabled ?? true,
    title: data?.title ?? '解决方案',
    subtitle: data?.subtitle,
    tagline: data?.tagline,
    items: data?.items ?? [],
    ui: {
      viewDetails: data?.ui?.viewDetails ?? '查看详情',
      prev: data?.ui?.prev ?? '上一项',
      next: data?.ui?.next ?? '下一项',
    },
    featuresTitle: data?.featuresTitle ?? '核心功能',
  };
}

// ============================================================================
// Hero 数据 Hook
// ============================================================================

export function useHero(): {
  data: HeroData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<HeroData>(FALLBACK_HERO_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      const normalized = normalizeHeroData(FALLBACK_HERO_DATA);
      setData(normalized);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch hero data');
      setError(error);
      setData(normalizeHeroData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// ============================================================================
// Features 数据 Hook
// ============================================================================

export function useFeatures(): {
  data: FeaturesData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<FeaturesData>(FALLBACK_FEATURES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 600));
      const normalized = normalizeFeaturesData(FALLBACK_FEATURES_DATA);
      setData(normalized);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch features data');
      setError(error);
      setData(normalizeFeaturesData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// ============================================================================
// Cases 数据 Hook
// ============================================================================

export function useCasesData(): {
  data: CasesData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<CasesData>(FALLBACK_CASES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 700));
      const normalized = normalizeCasesData(FALLBACK_CASES_DATA);
      setData(normalized);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch cases data');
      setError(error);
      setData(normalizeCasesData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// ============================================================================
// CTA 数据 Hook
// ============================================================================

export function useCTA(): {
  data: CTAData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<CTAData>(FALLBACK_CTA_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 800));
      const normalized = normalizeCTAData(FALLBACK_CTA_DATA);
      setData(normalized);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch CTA data');
      setError(error);
      setData(normalizeCTAData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// ============================================================================
// Solutions 数据 Hook
// ============================================================================

export function useSolutions(): {
  data: SolutionsData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<SolutionsData>(FALLBACK_SOLUTIONS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 400));
      const normalized = normalizeSolutionsData(FALLBACK_SOLUTIONS_DATA);
      setData(normalized);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch solutions data');
      setError(error);
      setData(normalizeSolutionsData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
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
