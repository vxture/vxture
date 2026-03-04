/**
 * useHero.ts - Hero 区块数据 Hook
 *
 * Application Layer - Hook
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { HeroContent } from '@/domain/homepage/hero.model';

/**
 * useHero Hook 配置选项
 */
export interface UseHeroOptions
  extends Omit<UseQueryOptions<HeroContent, Error>, 'queryKey' | 'queryFn'> {
  locale?: string;
}

/**
 * 获取 Hero 区块数据的 Hook
 *
 * @example
 * ```tsx
 * function HeroSection() {
 *   const { data: hero, isLoading } = useHero();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <section>
 *       <h1>{hero.title}</h1>
 *       <p>{hero.description}</p>
 *     </section>
 *   );
 * }
 * ```
 */
export const useHero = (options?: UseHeroOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<HeroContent, Error>({
    queryKey: ['hero', locale],
    queryFn: () => useCases.getHero.execute(locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};