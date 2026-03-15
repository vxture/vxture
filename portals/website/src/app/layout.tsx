/**
 * RootLayout - 根布局
 *
 * 职责：
 * - 定义基础 HTML 结构（<html>、<body>）
 * - 加载全局字体
 * - 配置元数据
 * - 不依赖 locale 的全局配置
 *
 * 注意：next-intl Provider 和其他依赖 locale 的内容应该在 [locale]/layout.tsx 中
 *
 * @package @vxture/website
 * @layer Presentation
 * @category Pages
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'vxture AI',
  description: 'AI-based virtual nature exploration platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className="">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
