/**
 * useFeatures.ts - Features 区块数据 Hook
 *
 * Application Layer - Hook
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { FeaturesContent } from '@/domain/homepage/features.model';

/**
 * useFeatures Hook 配置选项
 */
export interface UseFeaturesOptions
  extends Omit<UseQueryOptions<FeaturesContent, Error>, 'queryKey' | 'queryFn'> {
  locale?: string;
}

/**
 * 获取 Features 区块数据的 Hook
 *
 * @example
 * ```tsx
 * function FeaturesSection() {
 *   const { data: features, isLoading } = useFeatures();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <section>
 *       <h2>{features.title}</h2>
 *       <div>
 *         {features.items.map(item => (
 *           <FeatureCard key={item.title} {...item} />
 *         ))}
 *       </div>
 *     </section>
 *   );
 * }
 * ```
 */
export const useFeatures = (options?: UseFeaturesOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<FeaturesContent, Error>({
    queryKey: ['features', locale],
    queryFn: () => useCases.getFeatures.execute(locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};