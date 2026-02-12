/**
 * useCTA.ts - CTA 区块数据 Hook
 *
 * Application Layer - Hook
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { CTAContent } from '@/domain/homepage/cta.model';

/**
 * useCTA Hook 配置选项
 */
export interface UseCTAOptions
  extends Omit<UseQueryOptions<CTAContent, Error>, 'queryKey' | 'queryFn'> {
  locale?: string;
}

/**
 * 获取 CTA 区块数据的 Hook
 *
 * @example
 * ```tsx
 * function CTASection() {
 *   const { data: cta, isLoading } = useCTA();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <section>
 *       <h2>{cta.title}</h2>
 *       <p>{cta.description}</p>
 *       {cta.actions.map(action => (
 *         <Button key={action.text} {...action} />
 *       ))}
 *     </section>
 *   );
 * }
 * ```
 */
export const useCTA = (options?: UseCTAOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<CTAContent, Error>({
    queryKey: ['cta', locale],
    queryFn: () => useCases.getCTA.execute(locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};