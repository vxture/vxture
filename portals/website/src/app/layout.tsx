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

import Notifications from '@/components/common/Notifications';
import { GlobalProvider } from '@/shared/contexts/GlobalContext';

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
        <GlobalProvider>
          <Notifications />
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
