/**
 * useSolutions.ts - Solutions 区块数据 Hook
 *
 * Application Layer - Hook
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { SolutionsContent } from '@/domain/homepage/solutions.model';

/**
 * useSolutions Hook 配置选项
 */
export interface UseSolutionsOptions
  extends Omit<UseQueryOptions<SolutionsContent, Error>, 'queryKey' | 'queryFn'> {
  locale?: string;
}

/**
 * 获取 Solutions 区块数据的 Hook
 *
 * @example
 * ```tsx
 * function SolutionsSection() {
 *   const { data: solutions, isLoading } = useSolutions();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <section>
 *       <h2>{solutions.title}</h2>
 *       <div>
 *         {solutions.items.map(item => (
 *           <SolutionCard key={item.slug} {...item} />
 *         ))}
 *       </div>
 *     </section>
 *   );
 * }
 * ```
 */
export const useSolutions = (options?: UseSolutionsOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<SolutionsContent, Error>({
    queryKey: ['solutions', locale],
    queryFn: () => useCases.getSolutions.execute(locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};