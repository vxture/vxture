/**
 * RootLayout - 根布局
 *
 * 职责：
 * - 定义基础 HTML 结构（<html>、<body>）
 * - 加载全局字体
 * - 配置元数据
 * - 挂载 ThemeProvider，统一管理全站主题（由 next-themes 自动处理 DOM class）
 * - 挂载 FullscreenProvider，统一管理全站全屏状态
 * - 不依赖 locale 的全局配置
 *
 * 注意：next-intl Provider 和其他依赖 locale 的内容应该在 [locale]/layout.tsx 中
 *
 * @package @vxture/website
 * @layer Presentation
 * @category Pages
 * @author AI-Generated
 * @date 2026-03-18
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider, FullscreenProvider } from '@vxture/design-system';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'vxture AI',
  description: 'AI-based virtual nature exploration platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning 是 next-themes 官方要求，避免 SSR/CSR class 不一致警告
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* ThemeProvider 管理全站明暗主题，defaultTheme="system" 跟随系统偏好 */}
        <ThemeProvider defaultTheme="system">
          {/* FullscreenProvider 管理全站全屏状态，默认 pseudo 模式 */}
          <FullscreenProvider defaultMode="pseudo">
            {children}
          </FullscreenProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
