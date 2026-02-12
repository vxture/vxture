/**
 * QueryProvider.tsx - React Query Provider
 *
 * Presentation Layer - Provider Component
 *
 * 职责：
 * - 为应用提供 React Query 上下文
 * - 配置全局查询客户端设置
 *
 * @layer Presentation
 * @category Components - Common
 */
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // 使用 useState 确保每个客户端只创建一次 QueryClient
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认配置
            staleTime: 60 * 1000, // 1 分钟
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}