/**
 * useCases.ts - Cases 区块数据 Hook
 *
 * Application Layer - Hook
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { CasesContent } from '@/domain/homepage/cases.model';

/**
 * useCases Hook 配置选项
 */
export interface UseCasesOptions
  extends Omit<UseQueryOptions<CasesContent, Error>, 'queryKey' | 'queryFn'> {
  locale?: string;
}

/**
 * 获取 Cases 区块数据的 Hook
 *
 * @example
 * ```tsx
 * function CasesSection() {
 *   const { data: cases, isLoading } = useCases();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <section>
 *       <h2>{cases.title}</h2>
 *       <div>
 *         {cases.items.map(item => (
 *           <CaseCard key={item.slug} {...item} />
 *         ))}
 *       </div>
 *     </section>
 *   );
 * }
 * ```
 */
export const useContentCases = (options?: UseCasesOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<CasesContent, Error>({
    queryKey: ['cases', locale],
    queryFn: () => useCases.getCases.execute(locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};