/**
 * 首页数据规范化工具函数
 * @package @vxture/website
 * @layer Presentation
 * @category Utils
 */

import {
  HeroData,
  FeaturesData,
  CasesData,
  CTAData,
  SolutionsData,
} from '@/types/homepage';

// ============================================================================
// Hero 数据规范化
// ============================================================================

export function normalizeHeroData(data?: Partial<HeroData>): HeroData {
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

// ============================================================================
// Features 数据规范化
// ============================================================================

export function normalizeFeaturesData(data?: Partial<FeaturesData>): FeaturesData {
  return {
    enabled: data?.enabled ?? true,
    title: data?.title ?? '核心功能',
    subtitle: data?.subtitle,
    tagline: data?.tagline,
    items: data?.items ?? [],
  };
}

// ============================================================================
// Cases 数据规范化
// ============================================================================

export function normalizeCasesData(data?: Partial<CasesData>): CasesData {
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

// ============================================================================
// CTA 数据规范化
// ============================================================================

export function normalizeCTAData(data?: Partial<CTAData>): CTAData {
  return {
    enabled: data?.enabled ?? true,
    title: data?.title ?? '准备好开始了吗？',
    subtitle: data?.subtitle,
    actions: data?.actions ?? [],
    contact: data?.contact,
  };
}

// ============================================================================
// Solutions 数据规范化
// ============================================================================

export function normalizeSolutionsData(data?: Partial<SolutionsData>): SolutionsData {
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
