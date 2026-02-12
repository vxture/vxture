/**
 * useHeader.ts - Header 数据 Hook
 *
 * Application Layer - Hook
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { HeaderContent } from '@/domain/layout/header.model';

/**
 * useHeader Hook 配置选项
 */
export interface UseHeaderOptions
  extends Omit<UseQueryOptions<HeaderContent, Error>, 'queryKey' | 'queryFn'> {
  locale?: string;
}

/**
 * 获取 Header 数据的 Hook
 *
 * @example
 * ```tsx
 * function Header() {
 *   const { data: header, isLoading } = useHeader();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <header>
 *       <img src={header.logo.image} alt={header.logo.alt} />
 *       <nav>
 *         {header.navigation.map(item => (
 *           <Link key={item.href} href={item.href}>
 *             {item.label}
 *           </Link>
 *         ))}
 *       </nav>
 *     </header>
 *   );
 * }
 * ```
 */
export const useHeader = (options?: UseHeaderOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<HeaderContent, Error>({
    queryKey: ['header', locale],
    queryFn: () => useCases.getHeader.execute(locale),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};