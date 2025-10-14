/**
 * layout.tsx
 *
 * 功能：
 * - 统一管理 Next.js App 根布局，提供全局 html/head/body 模板、SEO、meta、预连接等
 * - 支持服务端初始化主题、语言，减少首屏闪烁
 * - 委托客户端副作用逻辑给 ClientSyncAgg 组件
 *
 * 用途：
 * - 作为全站根布局，包裹所有页面内容
 * - 结构与其它布局、页面组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 next/headers、next/font、ClientSyncAgg、Notifications 等
 * - 被所有页面自动包裹
 *
 * 设计规范：
 * - 只负责全局布局与服务端初始化，不包含业务逻辑
 * - 命名、结构、注释与其它页面/布局组件保持一致
 *
 * @file layout.tsx
 * @desc Next.js App 根布局组件，统一全局 html/head/body、SEO、主题、语言等
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Next.js
 * @see ./globals.css
 * @see @/components/common/ClientSyncAgg
 * @tags layout, app, root, nextjs
 * @example
 *   // 自动包裹所有页面，无需手动引入
 * @remarks
 *   仅负责全局布局与初始化，业务逻辑请移至页面/组件层。
 * @todo
 *   支持更多全局 SEO/性能优化配置
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cookies, headers } from 'next/headers';
// import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/cookies'; // 已移除，避免类型错误

import Notifications from '@/components/common/Notifications';
import ClientSyncAgg from '@/components/common/ClientSyncAgg';
import ThemeSync from '@/components/common/ThemeSync';
import I18nSync from '@/components/common/I18nSync';

const inter = Inter({ subsets: ['latin'] });

// 本地类型定义
type Theme = 'light' | 'dark';
type Locale = 'zh-CN' | 'en-US';

/**
 * generateMetadata - 同步生成元信息
 * 服务器组件中无需 async/await，直接同步处理
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
    title: titles[initialLocale],
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
  };
}

/**
 * getServerTheme - 同步获取服务器端主题设置
 * 服务器组件中cookies()是同步函数，无需await
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

/**
 * getServerLocale - 异步获取服务器端语言设置
 * 兼容 Next.js 15 headers() Promise
 */
async function getServerLocale(): Promise<Locale> {
  const headersList = await headers();
  const rawAccept =
    headersList.get('Accept-Language') ?? headersList.get('accept-language') ?? 'zh-CN';
  const acceptLanguage = rawAccept || 'zh-CN';
  const preferredLang = acceptLanguage.split(',')[0].split('-')[0] || 'zh';
  return preferredLang === 'en' ? 'en-US' : 'zh-CN';
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const serverTheme = await getServerTheme();
  const serverLocale = await getServerLocale();
  return (
    <html
      lang={serverLocale}
      data-theme={serverTheme}
      className={serverTheme === 'dark' ? 'dark' : ''}
    >
      <head>
        <link rel='icon' href='/icons/favicon.ico' />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#0e1726' />
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/favicon.ico' />
        <link rel='manifest' href='/manifest.json' />
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
        <link rel='dns-prefetch' href='//vxture.com' />
        <link rel='preconnect' href='https://vxture.com' crossOrigin='' />
      </head>
      <body className={inter.className}>
        {/* 全局副作用 client 组件，确保只挂载一份 */}
        <ThemeSync />
        <I18nSync />
        <ClientSyncAgg />
        <Notifications />
        {children}
      </body>
    </html>
  );
}

