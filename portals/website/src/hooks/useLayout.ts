/**
 * 布局相关 Hooks
 * @package @vxture/website
 * @layer Presentation
 * @category Hooks
 */

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { FALLBACK_HEADER_DATA, FALLBACK_FOOTER_DATA } from '@/fallback/layout.fallback';
import type { HeaderData, FooterData } from '@/types/layout.types';

// 导入翻译文件
import zhCNHeader from '@/../messages/zh-CN/layout/header.json';
import zhCNFooter from '@/../messages/zh-CN/layout/footer.json';
import enUSHeader from '@/../messages/en-US/layout/header.json';
import enUSFooter from '@/../messages/en-US/layout/footer.json';

// 翻译数据映射
const headerTranslations: Record<string, HeaderData> = {
  'zh-CN': zhCNHeader as HeaderData,
  'en-US': enUSHeader as HeaderData
};

const footerTranslations: Record<string, FooterData> = {
  'zh-CN': zhCNFooter as FooterData,
  'en-US': enUSFooter as FooterData
};

// ============================================================================
// useHeader Hook
// ============================================================================

export interface UseHeaderReturn {
  data: HeaderData;
  isLoading: boolean;
  error: Error | null;
}

/**
 * 获取 Header 数据的 Hook
 *
 * 使用示例：
 * ```tsx
 * function MyComponent() {
 *   const { data, isLoading, error } = useHeader();
 *   // ...
 * }
 * ```
 */
export function useHeader(): UseHeaderReturn {
  const locale = useLocale();

  const data = useMemo(() => {
    console.log('[useHeader] Locale:', locale);
    console.log('[useHeader] Available translations:', Object.keys(headerTranslations));

    const headerData = headerTranslations[locale] || headerTranslations['en-US'] || FALLBACK_HEADER_DATA;
    console.log('[useHeader] Using data:', headerData);

    return headerData;
  }, [locale]);

  return {
    data,
    isLoading: false,
    error: null
  };
}

// ============================================================================
// useFooter Hook
// ============================================================================

export interface UseFooterReturn {
  data: FooterData;
  isLoading: boolean;
  error: Error | null;
}

/**
 * 获取 Footer 数据的 Hook
 *
 * 使用示例：
 * ```tsx
 * function MyComponent() {
 *   const { data, isLoading, error } = useFooter();
 *   // ...
 * }
 * ```
 */
export function useFooter(): UseFooterReturn {
  const locale = useLocale();

  const data = useMemo(() => {
    console.log('[useFooter] Locale:', locale);
    console.log('[useFooter] Available translations:', Object.keys(footerTranslations));

    const footerData = footerTranslations[locale] || footerTranslations['en-US'] || FALLBACK_FOOTER_DATA;
    console.log('[useFooter] Using data:', footerData);

    return footerData;
  }, [locale]);

  return {
    data,
    isLoading: false,
    error: null
  };
}
