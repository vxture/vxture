/**
 * useLayout.ts - 完整布局数据 Hook
 *
 * Application Layer - Hook
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { LayoutAggregate } from '@/domain/layout/layout.aggregate';

/**
 * useLayout Hook 配置选项
 */
export interface UseLayoutOptions
  extends Omit<UseQueryOptions<LayoutAggregate, Error>, 'queryKey' | 'queryFn'> {
  locale?: string;
}

/**
 * 获取完整布局数据的 Hook
 *
 * @example
 * ```tsx
 * function AppLayout({ children }: { children: React.ReactNode }) {
 *   const { data: layout, isLoading } = useLayout();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <>
 *       <Header {...layout.header} />
 *       <main>{children}</main>
 *       <Footer {...layout.footer} />
 *     </>
 *   );
 * }
 * ```
 */
export const useLayout = (options?: UseLayoutOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<LayoutAggregate, Error>({
    queryKey: ['layout', locale],
    queryFn: () => useCases.getLayout.execute(locale),
    staleTime: 10 * 60 * 1000, // 10 分钟 - 布局变化较少
    gcTime: 30 * 60 * 1000, // 30 分钟
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};