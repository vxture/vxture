/**
 * metadata.ts
 *
 * 职责：
 * - 构建全局 SEO Metadata
 * - 与 Layout 解耦
 */

import type { Metadata } from 'next';
import type { Locale } from '@vxture/shared';

export function buildMetadata(locale: Locale): Metadata {
  const titles = {
    zh: 'vxture AI | 释放数据潜力',
    en: 'vxture AI | Unleash Data Potential',
  };

  const descriptions = {
    zh: '基于AI的虚拟自然探索平台',
    en: 'AI-based virtual nature exploration platform',
  };

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),

    title: {
      default: titles[locale],
      template: `%s | ${titles[locale]}`,
    },

    description: descriptions[locale],

    keywords:
      locale === 'zh'
        ? ['AI', '数据', '智能', '决策', '虚拟', '平台', 'vxture']
        : ['AI', 'data', 'intelligence', 'decision', 'virtual', 'platform', 'vxture'],

    authors: [{ name: 'vxture Team' }],

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: 'website',
      url: 'https://vxture.com',
      title: titles[locale],
      description: descriptions[locale],
      images: ['/icons/favicon.ico'],
    },

    twitter: {
      card: 'summary_large_image',
      title: titles[locale],
      description: descriptions[locale],
      images: ['/icons/favicon.ico'],
    },

    icons: {
      icon: '/icons/favicon.ico',
      apple: '/icons/favicon.ico',
    },

    manifest: '/manifest.json',
  };
}
