/**
 * 布局相关 Hooks
 * @package @vxture/website
 * @layer Presentation
 * @category Hooks
 */

import { useState, useEffect } from 'react';
import { FALLBACK_HEADER_DATA, FALLBACK_FOOTER_DATA } from '@/fallback/layout.fallback';
import type { HeaderData, FooterData } from '@/types/layout.types';

// ============================================================================
// useHeader Hook
// ============================================================================

export interface UseHeaderReturn {
  data: HeaderData | null;
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
  const [data, setData] = useState<HeaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 模拟 API 请求
    const fetchHeaderData = async () => {
      try {
        setIsLoading(true);
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        setData(FALLBACK_HEADER_DATA);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch header data'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHeaderData();
  }, []);

  return { data, isLoading, error };
}

// ============================================================================
// useFooter Hook
// ============================================================================

export interface UseFooterReturn {
  data: FooterData | null;
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
  const [data, setData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 模拟 API 请求
    const fetchFooterData = async () => {
      try {
        setIsLoading(true);
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        setData(FALLBACK_FOOTER_DATA);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch footer data'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFooterData();
  }, []);

  return { data, isLoading, error };
}
