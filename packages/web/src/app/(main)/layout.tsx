/**
 * layout.tsx
 *
 * 功能：
 * - 主布局组件，统一头部、底部、全局样式与 meta 标签
 * - 提供 SEO、PWA、社交分享等基础 meta 配置
 *
 * 用途：
 * - 作为主内容区的布局包裹，承载 children 页面内容
 * - 结构与其它 layout 组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 Header、Footer、globals.css
 * - 被 app/(main)/page.tsx 自动包裹
 *
 * 设计规范：
 * - 只负责布局与 meta，不包含业务逻辑
 * - 命名、结构、注释与其它 layout 组件保持一致
 *
 * @file app/(main)/layout.tsx
 * @desc 主内容区布局，统一头部、底部与 meta
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Next.js
 * @tags layout, main, meta, SEO
 * @example
 *   // 由 Next.js 自动路由，无需手动引入
 * @remarks
 *   仅负责布局与 meta，业务逻辑请移至页面/组件层。
 * @todo
 *   支持更多 SEO 与 meta 配置
 */
import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import '../globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'vxture AI | 释放数据潜力',
  description: 'AI-based virtual nature exploration平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='zh-CN'>
      <head>
        {/* Favicon */}
        <link rel='icon' href='/icons/favicon.ico' />

        {/* Charset */}
        <meta charSet='utf-8' />

        {/* Viewport for responsive design */}
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        {/* Theme color for browser UI */}
        <meta name='theme-color' content='#0e1726' />

        {/* Apple Touch Icon */}
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/favicon.ico' />

        {/* Manifest for PWA */}
        <link rel='manifest' href='/manifest.json' />

        {/* Open Graph for social sharing */}
        <meta property='og:title' content='vxture AI | 释放数据潜力' />
        <meta property='og:description' content='AI-based virtual nature exploration platform' />
        <meta property='og:image' content='/icons/favicon.ico' />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://vxture.com' />

        {/* Twitter Card */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='vxture AI | 释放数据潜力' />
        <meta name='twitter:description' content='AI-based virtual nature exploration platform' />
        <meta name='twitter:image' content='/icons/favicon.ico' />

        {/* Robots */}
        <meta name='robots' content='index, follow' />

        {/* Canonical URL */}
        <link rel='canonical' href='https://vxture.com' />

        {/* Language */}
        <meta httpEquiv='content-language' content='zh-CN' />

        {/* X-UA-Compatible for IE */}
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />

        {/* Author */}
        <meta name='author' content='vxture Team' />

        {/* Keywords */}
        <meta name='keywords' content='AI, 数据, 智能, 决策, 虚拟, 平台, vxture' />

        {/* Referrer Policy */}
        <meta name='referrer' content='no-referrer-when-downgrade' />

        {/* DNS Prefetch */}
        <link rel='dns-prefetch' href='//vxture.com' />

        {/* Preconnect for performance */}
        <link rel='preconnect' href='https://vxture.com' crossOrigin='' />

        {/* Additional meta tags can be added below */}
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
