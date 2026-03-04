/**
 * HomepageDefaults.ts - Homepage sections 默认值
 *
 * 用于 fallback 或数据规范化，确保即使数据加载失败，
 * 组件也能有默认数据用于调试和显示
 */

import type { HeroContent } from '@/domain/homepage/hero.model';
import type { FeaturesContent } from '@/domain/homepage/features.model';
import type { SolutionsContent } from '@/domain/homepage/solutions.model';
import type { CasesContent } from '@/domain/homepage/cases.model';
import type { CTAContent } from '@/domain/homepage/cta.model';

/**
 * Hero Section 默认值
 */
export const FALLBACK_HERO: HeroContent = {
  key: 'hero',
  enabled: true,
  theme: 'brand',
  intent: 'cta',
  variant: 'highlight',
  title: '释放数据的',
  titleHighlight: '无限潜力',
  description: '面向政企复杂业务场景，构建数据驱动的业务智能体系',
  cta: {
    label: '开启探索之旅',
    href: '/products',
  },
  media: {
    type: 'image',
    url: '/images/herosection/banner-hero-poster-light-01.png',
    alt: 'Hero Background',
  },
  scrollIndicator: {
    enabled: true,
    text: '向下滚动',
  },
};

/**
 * Features Section 默认值
 */
export const FALLBACK_FEATURES: FeaturesContent = {
  key: 'features',
  enabled: true,
  icon: 'chart',
  title: '核心能力',
  subtitle: '基于先进技术架构，提供全方位的智能解决方案',
  tagline: '技术驱动创新',
  items: [
    {
      id: 'feature-1',
      slug: 'data-processing',
      title: '数据处理',
      description: '高性能数据处理引擎，支持海量数据实时分析',
      icon: 'database',
      intent: 'simulation',
      theme: 'primary',
      variant: 'card',
      highlights: ['实时处理', '海量数据', '高可用'],
      cta: {
        label: '了解更多',
        href: '/features/data-processing',
      },
    },
  ],
};

/**
 * Solutions Section 默认值
 */
export const FALLBACK_SOLUTIONS: SolutionsContent = {
  key: 'solutions',
  enabled: true,
  title: '解决方案',
  subtitle: '针对不同行业场景，提供定制化解决方案',
  tagline: '行业领先实践',
  featuresTitle: '核心特性',
  ui: {
    viewDetails: '申请试用',
    prev: '上一个',
    next: '下一个',
  },
  items: [
    {
      id: 'solution-1',
      slug: 'enterprise',
      title: '企业级方案',
      subtitle: '为大型企业提供完整的数字化转型解决方案',
      description: '为大型企业提供完整的数字化转型解决方案',
      icon: 'building',
      intent: 'solution',
      theme: 'primary',
      variant: 'grid',
      tags: ['安全可靠', '灵活扩展', '深度集成'],
      capabilities: ['安全可靠', '灵活扩展', '深度集成'],
      cover: {
        url: '/images/productssection/product-intro-01.jpg',
        alt: '企业级方案',
      },
      cta: {
        href: '/solutions/enterprise',
      },
    },
  ],
};

/**
 * Cases Section 默认值
 */
export const FALLBACK_CASES: CasesContent = {
  key: 'cases',
  enabled: true,
  title: '客户案例',
  subtitle: '看看我们的客户如何使用我们的产品取得成功',
  tagline: '成功故事',
  ui: {
    viewDetails: '阅读完整案例',
  },
  items: [
    {
      id: 'case-1',
      slug: 'case-study-1',
      title: '某大型企业数字化转型',
      description: '帮助客户实现业务流程数字化，提升效率 300%',
      intent: 'solution',
      theme: 'primary',
      variant: 'card',
      tags: ['金融', '数字化转型'],
      publishedAt: '2024-01-01',
      cover: {
        url: '/images/casessection/case-intro-01.jpg',
        alt: '某大型企业数字化转型',
      },
      cta: {
        href: '/cases/case-study-1',
      },
    },
  ],
};

/**
 * CTA Section 默认值
 */
export const FALLBACK_CTA: CTAContent = {
  key: 'cta',
  enabled: true,
  title: '您准备释放数据潜力了吗？',
  subtitle: '从方案设计到落地实战，我们与您并肩推进每一步',
  features: [
    {
      id: 'features-cta-01',
      icon: 'layers',
      name: '方案快速落地',
      description: '深度研判业务场景，提供行业级整体解决方案',
      theme: 'primary',
    },
    {
      id: 'features-cta-02',
      icon: 'users',
      name: '人工智能协同',
      description: '全过程智能体深度参与，提升落地效率和效果',
      theme: 'primary',
    },
    {
      id: 'features-cta-03',
      icon: 'refresh',
      name: '持续演进创新',
      description: '围绕业务目标持续迭代，实现技术和业务升级',
      theme: 'primary',
    },
  ],
  actions: [
    {
      label: '预约咨询',
      href: '/contact',
      variant: 'primary',
      icon: 'calendar',
    },
    {
      label: '在线沟通',
      href: '/ruins-agent',
      variant: 'secondary',
      icon: 'bot',
    },
  ],
  contact: {
    description: '随时与我们的专家团队直接沟通，获取针对您业务场景的专业建议',
    email: {
      icon: 'mail',
      value: 'experts@vxture.com',
    },
    phone: {
      icon: 'phone',
      value: '029-12345678',
    },
  },
};
