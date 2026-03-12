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
} from '@/types/homepage';
import {
  MOCK_HERO_DATA,
  MOCK_FEATURES_DATA,
  MOCK_CASES_DATA,
  MOCK_CTA_DATA,
  MOCK_SOLUTIONS_DATA,
} from '@/data/homepage.mock';
import {
  normalizeHeroData,
  normalizeFeaturesData,
  normalizeCasesData,
  normalizeCTAData,
  normalizeSolutionsData,
} from '@/utils/homepageHelpers';

// ============================================================================
// Hero 数据 Hook
// ============================================================================

export function useHero(): {
  data: HeroData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<HeroData>(MOCK_HERO_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      // const response = await getContent('hero', locale);
      // const normalized = normalizeHeroData(response);

      // 暂时使用模拟数据
      await new Promise((resolve) => setTimeout(resolve, 500));
      const normalized = normalizeHeroData(MOCK_HERO_DATA);
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
  const [data, setData] = useState<FeaturesData>(MOCK_FEATURES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 600));
      const normalized = normalizeFeaturesData(MOCK_FEATURES_DATA);
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
  const [data, setData] = useState<CasesData>(MOCK_CASES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 700));
      const normalized = normalizeCasesData(MOCK_CASES_DATA);
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
  const [data, setData] = useState<CTAData>(MOCK_CTA_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 800));
      const normalized = normalizeCTAData(MOCK_CTA_DATA);
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
  const [data, setData] = useState<SolutionsData>(MOCK_SOLUTIONS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里可以替换为实际的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 400));
      const normalized = normalizeSolutionsData(MOCK_SOLUTIONS_DATA);
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
