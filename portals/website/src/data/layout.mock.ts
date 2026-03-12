/**
 * 布局组件模拟数据
 * @package @vxture/website
 * @layer Presentation
 * @category Mock Data
 */

import type { HeaderData, FooterData } from '@/types/layout';

// ============================================================================
// Header 模拟数据
// ============================================================================

export const MOCK_HEADER_DATA: HeaderData = {
  enabled: true,
  logo: {
    image: '/logo.svg',
    alt: 'Vxture Logo',
    text: 'Vxture',
  },
  nav: [
    { href: '/solutions', label: '解决方案' },
    { href: '/cases', label: '客户案例' },
    { href: '/about', label: '关于我们' },
  ],
  theme: {
    title: '切换主题',
  },
  language: {
    enabled: true,
    title: '切换语言',
    options: [
      { code: 'zh-CN', label: '中文' },
      { code: 'en-US', label: 'English' },
    ],
  },
  actions: [
    { href: '/contact', label: '联系我们', variant: 'secondary' },
    { href: '/login', label: '登录', variant: 'primary' },
  ],
};

// ============================================================================
// Footer 模拟数据
// ============================================================================

export const MOCK_FOOTER_DATA: FooterData = {
  enabled: true,
  brand: {
    name: 'Vxture',
    address: '中国·北京·朝阳区',
  },
  contact: {
    sales: {
      phone: '400-123-4567',
      email: 'sales@vxture.com',
    },
    service: {
      phone: '400-987-6543',
      email: 'support@vxture.com',
    },
  },
  social: [
    {
      name: 'wechat',
      icon: 'wechat',
      href: '/qrcode-wechat.png',
      ariaLabel: '微信',
    },
    {
      name: 'github',
      icon: 'github',
      href: 'https://github.com/vxture',
      ariaLabel: 'GitHub',
    },
    {
      name: 'linkedin',
      icon: 'linkedin',
      href: 'https://linkedin.com/company/vxture',
      ariaLabel: 'LinkedIn',
    },
  ],
  sections: [
    {
      id: 'solutions',
      title: '解决方案',
      links: [
        { href: '/solutions/ai', label: 'AI 自动化' },
        { href: '/solutions/cloud', label: '云计算' },
        { href: '/solutions/iot', label: '物联网' },
      ],
    },
    {
      id: 'company',
      title: '关于我们',
      links: [
        { href: '/about/team', label: '团队介绍' },
        { href: '/about/culture', label: '企业文化' },
        { href: '/about/careers', label: '加入我们' },
      ],
    },
    {
      id: 'resources',
      title: '资源中心',
      links: [
        { href: '/blog', label: '博客' },
        { href: '/docs', label: '文档' },
        { href: '/support', label: '帮助中心' },
      ],
    },
  ],
  copyright: {
    text: '© 2025 Vxture. All rights reserved.',
  },
  legal: [
    { href: '/privacy', label: '隐私政策' },
    { href: '/terms', label: '服务条款' },
    { href: '/cookies', label: 'Cookie 政策' },
  ],
  icp: {
    text: '京ICP备xxxxxxxx号',
    link: 'https://beian.miit.gov.cn/',
  },
  publicSecurity: {
    text: '京公网安备xxxxxxxx号',
    link: 'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=xxxxxxxx',
  },
};

// ============================================================================
// 备用数据（数据加载失败时使用）
// ============================================================================

export const FALLBACK_HEADER_DATA: HeaderData = {
  enabled: true,
  logo: {
    image: '/logo.svg',
    alt: 'Vxture Logo',
    text: 'Vxture',
  },
  nav: [
    { href: '/solutions', label: '解决方案' },
    { href: '/cases', label: '客户案例' },
    { href: '/about', label: '关于我们' },
  ],
  theme: {
    title: '切换主题',
  },
  language: null,
  actions: [
    { href: '/contact', label: '联系我们', variant: 'secondary' },
    { href: '/login', label: '登录', variant: 'primary' },
  ],
};

export const FALLBACK_FOOTER_DATA: FooterData = {
  enabled: true,
  brand: {
    name: 'Vxture',
    address: '中国·北京·朝阳区',
  },
  contact: {
    sales: {
      phone: '400-123-4567',
      email: 'sales@vxture.com',
    },
  },
  social: [
    {
      name: 'github',
      icon: 'github',
      href: 'https://github.com/vxture',
      ariaLabel: 'GitHub',
    },
    {
      name: 'linkedin',
      icon: 'linkedin',
      href: 'https://linkedin.com/company/vxture',
      ariaLabel: 'LinkedIn',
    },
  ],
  sections: [
    {
      id: 'solutions',
      title: '解决方案',
      links: [
        { href: '/solutions/ai', label: 'AI 自动化' },
        { href: '/solutions/cloud', label: '云计算' },
      ],
    },
    {
      id: 'company',
      title: '关于我们',
      links: [
        { href: '/about/team', label: '团队介绍' },
        { href: '/about/careers', label: '加入我们' },
      ],
    },
  ],
  copyright: {
    text: '© 2025 Vxture. All rights reserved.',
  },
  legal: [
    { href: '/privacy', label: '隐私政策' },
    { href: '/terms', label: '服务条款' },
  ],
  icp: null,
  publicSecurity: null,
};
