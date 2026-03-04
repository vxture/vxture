// HeaderDefaults.ts
import type { HeaderContent } from '@/domain/layout/header.model';

/**
 * 网站全局 Header 默认值
 * 用于 fallback 或数据规范化
 */
export const FALLBACK_HEADER: HeaderContent = {
  key: 'header',
  enabled: true,
  logo: {
    image: '/icons/favicon.ico',
    alt: 'vxture',
    text: 'vxture',
    href: '/',
  },
  nav: [
    { label: '首页', href: '/' },
    { label: '产品', href: '/products' },
    { label: '关于', href: '/about' },
  ],
  actions: [
    { label: '注册', href: '/signup', variant: 'secondary' },
    { label: '登录', href: '/login', variant: 'primary' },
  ],
  language: {
    enabled: true,
    icon: 'globe',
    title: '切换语言',
    options: [
      { code: 'zh-CN', label: '简体中文' },
      { code: 'en-US', label: 'English' },
    ],
  },
  theme: {
    enabled: true,
    icon: 'sun',
    title: '切换主题',
    options: [
      { code: 'light', label: '浅色' },
      { code: 'dark', label: '深色' },
    ],
  },
};
