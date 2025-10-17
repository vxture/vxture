/**
 * @file layout.tsx
 * @desc Next.js App Router 根布局组件（Root Layout），作为所有页面的顶层容器。
 * 负责：
 *    1. 定义全局 HTML 结构（html/head/body）；
 *    2. 统一管理全局元数据（SEO）、主题配置、多语言初始化；
 *    3. 注入全局依赖（如样式、状态 Provider、客户端同步逻辑）。
 * @component 标记为 React 组件（Next.js 根布局组件）
 *
 * @version 1.0.0
 * @since 1.0.0 （从该版本开始作为根布局使用）
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 *
 * @dependencies
 *   - React 19.2：组件基础
 *   - Next.js 15.5.6：App Router 布局机制、Metadata API
 *   - TailwindCSS 4.1.14：全局样式
 *   - Zustand 5.0.8：主题状态管理依赖
 * @see ./globals.css：全局样式入口（Tailwind 引入及自定义样式）
 * @see @/components/common/ClientSyncAgg：客户端状态同步组件（用于主题/语言的客户端同步）
 *
 * @tags layout, app-router, root-layout, seo, theme, i18n
 *
 * @example
 *   // 在 App Router 中自动生效，目录结构如下：
 *   // src/
 *   //   app/
 *   //     layout.tsx  <-- 当前文件，包裹所有页面
 *   //     page.tsx    <-- 首页，被 layout 包裹
 *   //     about/
 *   //       page.tsx  <-- 关于页，被 layout 包裹
 *
 * @remarks
 *   - 根布局不可省略，所有页面均会被其包裹（Next.js 强制要求）。
 *   - 仅包含全局共享逻辑：如 <html> 标签属性、全局 Provider（ThemeProvider/QueryClientProvider）、
 *     导航栏/页脚等全站通用组件。
 *   - 禁止放入页面级业务逻辑（如某个页面的表单、列表），避免污染全局布局。
 *
 * @todo
 *   - 补充全局 SEO 优化：自动生成 sitemap.xml、配置 robots.txt
 *   - 优化主题切换性能：减少布局重绘
 *   - 支持多语言动态元数据（当前仅支持初始语言）
 *   - 集成 Google Analytics 全局脚本
 */

// ==============================================================================
// 依赖导入 & 配置
// ==============================================================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // ✅ 唯一全局样式入口
import { cookies, headers } from 'next/headers';

// ------------------------------------------------------------------------------
// 组件导入
// ------------------------------------------------------------------------------

import Notifications from '@/components/common/Notifications';
import ClientSyncAgg from '@/components/common/ClientSyncAgg';

// ------------------------------------------------------------------------------
// 字体配置
// ------------------------------------------------------------------------------

const inter = Inter({ subsets: ['latin'] });

// ==============================================================================
// 类型定义
// ==============================================================================

// 本地类型定义
type Theme = 'light' | 'dark';
type Locale = 'zh-CN' | 'en-US';

// ==============================================================================
// 元数据生成
// ==============================================================================

/**
 * generateMetadata - 动态生成元信息
 * 根据服务器端检测的语言生成对应的 SEO 元数据
 * @returns Promise<Metadata> 元数据对象
 */
export async function generateMetadata(): Promise<Metadata> {
  // 服务器端异步获取初始语言
  const initialLocale = await getServerLocale();

  const titles = {
    'zh-CN': 'vxture AI | 释放数据潜力',
    'en-US': 'vxture AI | Unleash Data Potential',
  };

  const descriptions = {
    'zh-CN': '基于AI的虚拟自然探索平台',
    'en-US': 'AI-based virtual nature exploration platform',
  };

  return {
    title: {
      default: titles[initialLocale],
      template: '%s | ' + titles[initialLocale],
    },
    description: descriptions[initialLocale],
    openGraph: {
      title: titles[initialLocale],
      description: descriptions[initialLocale],
      images: ['/icons/favicon.ico'],
      type: 'website',
      url: 'https://vxture.com',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[initialLocale],
      description: descriptions[initialLocale],
      images: ['/icons/favicon.ico'],
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  };
}

// ==============================================================================
// 服务器端工具函数
// ==============================================================================

// ------------------------------------------------------------------------------
// 主题检测
// ------------------------------------------------------------------------------

/**
 * getServerTheme - 获取服务器端主题设置
 * 从 Cookie 中读取用户保存的主题偏好，兼容 Next.js 15 异步 cookies()
 * @returns Promise<Theme> 主题类型（light | dark）
 */
async function getServerTheme(): Promise<Theme> {
  // 兼容 Next.js 15 cookies() Promise
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get('theme-storage')?.value;

  try {
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      return parsed.theme === 'dark' ? 'dark' : 'light';
    }
  } catch (e) {
    console.error('解析主题失败:', e);
  }

  return 'light';
}

// ------------------------------------------------------------------------------
// 语言检测
// ------------------------------------------------------------------------------

/**
 * getServerLocale - 获取服务器端语言设置
 * 从 HTTP Accept-Language 头部检测用户首选语言，兼容 Next.js 15 异步 headers()
 * @returns Promise<Locale> 语言类型（zh-CN | en-US）
 */
async function getServerLocale(): Promise<Locale> {
  const headersList = await headers();
  const rawAccept =
    headersList.get('Accept-Language') ?? headersList.get('accept-language') ?? 'zh-CN';
  const acceptLanguage = rawAccept || 'zh-CN';
  const preferredLang = acceptLanguage.split(',')[0].split('-')[0] || 'zh';
  return preferredLang === 'en' ? 'en-US' : 'zh-CN';
}

// ==============================================================================
// 根布局组件
// ==============================================================================

/**
 * RootLayout - Next.js App Router 根布局组件
 * 提供全局 HTML 结构、主题初始化、语言配置等
 * @param children React 子节点（所有页面内容）
 * @returns JSX.Element 完整的 HTML 文档结构
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ----------------------------------------------------------------------------
  // 服务端初始化
  // ----------------------------------------------------------------------------

  const serverTheme = await getServerTheme();
  const serverLocale = await getServerLocale();

  return (
    <html
      lang={serverLocale}
      data-theme={serverTheme}
      className={serverTheme === 'dark' ? 'dark' : ''}
    >
      <head>
        {/* ----------------------------------------------------------------------------
            网站图标 & 基础 Meta
            -------------------------------------------------------------------------- */}
        <link rel='icon' href='/icons/favicon.ico' />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#0e1726' />
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/favicon.ico' />
        <link rel='manifest' href='/manifest.json' />

        {/* ----------------------------------------------------------------------------
            SEO & 搜索引擎优化
            -------------------------------------------------------------------------- */}
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href='https://vxture.com' />
        <meta httpEquiv='content-language' content={serverLocale} />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='author' content='vxture Team' />
        <meta
          name='keywords'
          content={
            serverLocale === 'zh-CN'
              ? 'AI, 数据, 智能, 决策, 虚拟, 平台, vxture'
              : 'AI, data, intelligence, decision, virtual, platform, vxture'
          }
        />
        <meta name='referrer' content='no-referrer-when-downgrade' />

        {/* ----------------------------------------------------------------------------
            性能优化 & 预连接
            -------------------------------------------------------------------------- */}
        <link rel='dns-prefetch' href='//vxture.com' />
        <link rel='preconnect' href='https://vxture.com' crossOrigin='' />
      </head>
      <body className={inter.className}>
        {/* =============================================================================
            全局客户端组件 - 状态同步 & 通知系统
            ============================================================================== */}

        {/* 客户端聚合同步组件 - 处理主题、语言等全局副作用 */}
        <ClientSyncAgg />

        {/* 全局通知系统 */}
        <Notifications />

        {/* =============================================================================
            页面内容区域
            ============================================================================== */}
        {children}
      </body>
    </html>
  );
}
