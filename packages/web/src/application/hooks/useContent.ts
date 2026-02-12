/**
 * Layer 2: 能力层 - 内容获取 Hook
 * 职责：组件与 Layer 3 contentClient 的唯一桥梁
 *
 * 特点：
 * - 集成 React Query 处理加载/错误状态
 * - 根据当前语言自动获取对应内容
 * - 提供重试和错误恢复
 * - 类型安全：根据 key 自动推断返回类型
 */

import { useQuery } from '@tanstack/react-query';
import { contentClient } from '@/clients/contentClient';
import { useLocale } from './useLocale';
import type { ContentKey, ContentTypeMap } from '@/types/content.types';

interface UseContentOptions {
  retry?: number; // 默认重试次数
  retryDelay?: number; // 重试延迟（ms）
  enabled?: boolean; // 是否启用查询
  staleTime?: number; // 数据新鲜时间（ms）
  gcTime?: number; // 垃圾回收时间（ms）
}

interface UseContentReturn<T = unknown> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 获取页面内容的 Hook（类型安全版本）
 *
 * 使用示例：
 * ```tsx
 * function HeroSection() {
 *   const { data, isLoading } = useContent('hero')
 *   // data 的类型会自动推断为 HeroContent
 *   if (isLoading) return <Skeleton />
 *   return <Hero title={data.title} />
 * }
 * ```
 */
export function useContent<K extends ContentKey>(
  key: K,
  options?: UseContentOptions
): UseContentReturn<ContentTypeMap[K]>;

/**
 * 获取页面内容的 Hook（通用版本）
 */
export function useContent<T = unknown>(
  key: string,
  options?: UseContentOptions
): UseContentReturn<T>;

/**
 * 实现
 */
export function useContent<T = unknown>(
  key: string,
  options: UseContentOptions = {}
): UseContentReturn<T> {
  const { locale } = useLocale();

  const {
    retry = 2,
    retryDelay = 1000,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 默认 5 分钟
    gcTime = 10 * 60 * 1000, // 默认 10 分钟
  } = options;

  const { data, isLoading, isError, error, refetch } = useQuery<T, Error>({
    queryKey: ['content', key, locale],
    queryFn: async () => {
      const result = await contentClient.getContent(key, locale);
      return result as T;
    },
    retry,
    retryDelay,
    enabled,
    staleTime,
    gcTime,
  });

  return {
    data,
    isLoading,
    isError,
    error: error || null,
    refetch: () => refetch(),
  };
}

/**
 * 批量获取多个内容的 Hook（未来可用）
 * 使用示例：
 * ```tsx
 * const { data } = useMultiContent(['hero', 'features', 'products'])
 * ```
 */
export function useMultiContent<T = unknown>(
  keys: string[],
  options: UseContentOptions = {}
): UseContentReturn<Record<string, T>> {
  const { locale } = useLocale();
  const { retry = 2, retryDelay = 1000, enabled = true } = options;

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Record<string, T>, Error>({
    queryKey: ['content-multi', keys, locale],
    queryFn: async () => {
      const promises = keys.map((key) =>
        contentClient.getContent(key, locale).then((data) => [key, data] as const)
      );
      const entries = await Promise.all(promises);
      return Object.fromEntries(entries) as Record<string, T>;
    },
    retry,
    retryDelay,
    enabled,
  });

  return {
    data: result,
    isLoading,
    isError,
    error: error || null,
    refetch: () => refetch(),
  };
}
