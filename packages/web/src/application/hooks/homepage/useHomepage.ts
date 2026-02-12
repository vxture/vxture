/**
 * useHomepage.ts - 首页完整数据 Hook
 *
 * Application Layer - Hook
 *
 * 职责：
 * - 提供 React 组件访问首页数据的接口
 * - 集成 React Query 管理加载/错误/缓存状态
 * - 自动获取当前语言的数据
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { HomepageAggregate } from '@/domain/homepage/homepage.aggregate';

/**
 * useHomepage Hook 配置选项
 */
export interface UseHomepageOptions
  extends Omit<UseQueryOptions<HomepageAggregate, Error>, 'queryKey' | 'queryFn'> {
  locale?: string; // 可选：覆盖当前语言
}

/**
 * 获取首页完整数据的 Hook
 *
 * @example
 * ```tsx
 * function HomePage() {
 *   const { data: homepage, isLoading, error } = useHomepage();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <>
 *       <HeroSection {...homepage.hero} />
 *       <FeaturesSection {...homepage.features} />
 *       <SolutionsSection {...homepage.solutions} />
 *       <CasesSection {...homepage.cases} />
 *       <CTASection {...homepage.cta} />
 *     </>
 *   );
 * }
 * ```
 */
export const useHomepage = (options?: UseHomepageOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<HomepageAggregate, Error>({
    queryKey: ['homepage', locale],
    queryFn: () => useCases.getHomepage.execute(locale),
    staleTime: 5 * 60 * 1000, // 5 分钟
    gcTime: 10 * 60 * 1000, // 10 分钟
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};