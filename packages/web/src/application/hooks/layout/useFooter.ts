/**
 * useFooter.ts - Footer 数据 Hook
 *
 * Application Layer - Hook
 *
 * @layer Application
 * @category Hooks
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useLocale } from '../shared/useLocale';
import { useCases } from '@/application/usecases';
import type { FooterContent } from '@/domain/layout/footer.model';

/**
 * useFooter Hook 配置选项
 */
export interface UseFooterOptions
  extends Omit<UseQueryOptions<FooterContent, Error>, 'queryKey' | 'queryFn'> {
  locale?: string;
}

/**
 * 获取 Footer 数据的 Hook
 *
 * @example
 * ```tsx
 * function Footer() {
 *   const { data: footer, isLoading } = useFooter();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <footer>
 *       <div>
 *         {footer.sections.map(section => (
 *           <div key={section.title}>
 *             <h3>{section.title}</h3>
 *             <ul>
 *               {section.links.map(link => (
 *                 <li key={link.href}>
 *                   <Link href={link.href}>{link.label}</Link>
 *                 </li>
 *               ))}
 *             </ul>
 *           </div>
 *         ))}
 *       </div>
 *       <div>{footer.copyright}</div>
 *     </footer>
 *   );
 * }
 * ```
 */
export const useFooter = (options?: UseFooterOptions) => {
  const { locale: currentLocale } = useLocale();
  const locale = options?.locale ?? currentLocale;

  return useQuery<FooterContent, Error>({
    queryKey: ['footer', locale],
    queryFn: () => useCases.getFooter.execute(locale),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};