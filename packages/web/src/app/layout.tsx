/**
 * layout.tsx - 根布局（Server Component）
 *
 * 功能：
 *  - 提供站点全局 html/head/body 模板（SEO、meta、预连接等）。
 *  - 在服务器端读取 cookies/headers 来初始化主题与语言，减少首屏闪烁（FOUC）。
 *  - 将客户端需要的 DOM/浏览器交互逻辑委托给 ClientSyncAgg（客户端组件）。
 *
 * 设计原则：
 *  - 保持为纯 Server Component，不使用 'use client' 标记
 *  - 避免在服务器组件中使用 await 处理同步API（cookies/headers）
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 时间：2024-06-01
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cookies, headers } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/cookies'; // 新增，明确 cookies() 类型

import Notifications from '@/components/common/Notifications';
import ClientSyncAgg from '@/components/common/ClientSyncAgg';

const inter = Inter({ subsets: ['latin'] });

// 本地类型定义
type Theme = 'light' | 'dark';
type Locale = 'zh-CN' | 'en-US';

/**
 * generateMetadata - 同步生成元信息
 * 服务器组件中无需 async/await，直接同步处理
 */
export function generateMetadata(): Metadata {
  // 服务器端同步获取初始语言
  const initialLocale = getServerLocale();

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
function getServerTheme(): Theme {
  // 使用本地类型别名做断言，避免导入内部模块
  const cookieStore = cookies() as ReadonlyRequestCookies;
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
 * getServerLocale - 同步获取服务器端语言设置
 * 服务器组件中headers()是同步函数，无需await
 */
function getServerLocale(): Locale {
  // 定义 headers 结构类型（仅包含我们需要的 get 方法）
  const headersList = headers()!;

  // 后续逻辑保持不变
  const rawAccept =
    headersList.get('Accept-Language') ?? headersList.get('accept-language') ?? 'zh-CN';

  const acceptLanguage = rawAccept || 'zh-CN';
  const preferredLang = acceptLanguage.split(',')[0].split('-')[0] || 'zh';

  return preferredLang === 'en' ? 'en-US' : 'zh-CN';
}

/**
 * RootLayout - 纯服务器组件根布局
 * 移除所有async/await，保持同步执行
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 同步获取服务器端初始化数据
  const serverTheme = getServerTheme();
  const serverLocale = getServerLocale();

  return (
    <html
      lang={serverLocale}
      data-theme={serverTheme}
      className={serverTheme === 'dark' ? 'dark' : ''}
    >
      <head>
        {/* 基础配置 */}
        <link rel='icon' href='/icons/favicon.ico' />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#0e1726' />

        {/* 图标配置 */}
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/favicon.ico' />
        <link rel='manifest' href='/manifest.json' />

        {/* SEO相关 */}
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href='https://vxture.com' />
        <meta httpEquiv='content-language' content={serverLocale} />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='author' content='vxture Team' />

        {/* 多语言关键词 */}
        <meta
          name='keywords'
          content={
            serverLocale === 'zh-CN'
              ? 'AI, 数据, 智能, 决策, 虚拟, 平台, vxture'
              : 'AI, data, intelligence, decision, virtual, platform, vxture'
          }
        />

        {/* 性能优化 */}
        <meta name='referrer' content='no-referrer-when-downgrade' />
        <link rel='dns-prefetch' href='//vxture.com' />
        <link rel='preconnect' href='https://vxture.com' crossOrigin='' />
      </head>

      <body className={inter.className}>
        {/* 客户端同步逻辑集中在 ClientSyncAgg（单一 client component） */}
        <ClientSyncAgg />

        {/* 全局通知组件（通常为客户端组件，可在 server layout 中引用 client component） */}
        <Notifications />

        {/* 页面内容 */}
        {children}
      </body>
    </html>
  );
}
