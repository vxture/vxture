/**
 * RootLayout
 *
 * 职责：
 * - 定义 HTML 结构
 * - 初始化服务器上下文（theme / locale）
 * - 注入全局运行时 Provider
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { resolveServerContext } from '@/infrastructure/runtime/serverContext';
import { buildMetadata } from './metadata';

import QueryProvider from '@/presentation/providers/QueryProvider';
import ClientSyncAgg from '@/presentation/providers/ClientSyncAgg';
import Notifications from '@/presentation/components/common/Notifications';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await resolveServerContext();
  return buildMetadata(locale);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, theme } = await resolveServerContext();

  return (
    <html lang={locale} data-theme={theme} className={theme === 'dark' ? 'dark' : ''}>
      <body className={inter.className}>
        <QueryProvider>
          <ClientSyncAgg />
          <Notifications />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
