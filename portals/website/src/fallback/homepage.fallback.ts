/**
 * 首页降级数据（Fallback Data）
 *
 * 用途：
 * - 接口失败或网络异常时使用的兜底数据
 * - 保证页面不会白屏，提升用户体验
 * - 不是测试 mock 数据，是生产环境可用的安全兜底
 *
 * @package @vxture/website
 * @layer Presentation
 * @category Fallback Data
 */

import {
  HeroData,
  FeaturesData,
  CasesData,
  CTAData,
  SolutionsData,
} from '@/types/homepage.types';

// ============================================================================
// Hero 区块降级数据
// ============================================================================

export const FALLBACK_HERO_DATA: HeroData = {
  enabled: true,
  title: '智能平台',
  titleHighlight: '重新定义体验',
  description: '为企业提供全方位的智能解决方案，提升运营效率，创造卓越用户体验',
  media: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=2000&auto=format&fit=crop',
    alt: '智能平台背景',
  },
  cta: {
    label: '立即开始',
    href: '/products',
  },
  scrollIndicator: {
    enabled: true,
    text: '向下滚动了解更多',
  },
};

// ============================================================================
// Features 区块降级数据
// ============================================================================

export const FALLBACK_FEATURES_DATA: FeaturesData = {
  enabled: true,
  title: '核心功能',
  subtitle: '我们提供强大且灵活的功能，帮助您实现业务目标',
  tagline: '探索无限可能',
  items: [
    {
      id: 'feature-1',
      slug: 'ai-powered',
      title: 'AI 驱动',
      description: '利用人工智能技术，提供智能化的解决方案和自动化流程',
      icon: 'sparkles',
      highlights: ['智能推荐', '自动化处理', '机器学习'],
      cta: { label: '了解更多', href: '/features/ai-powered' },
    },
    {
      id: 'feature-2',
      slug: 'scalable',
      title: '高度可扩展',
      description: '灵活的架构设计，支持业务快速增长和扩展',
      icon: 'server',
      highlights: ['弹性扩展', '高性能', '高可用'],
      cta: { label: '了解更多', href: '/features/scalable' },
    },
    {
      id: 'feature-3',
      slug: 'secure',
      title: '安全可靠',
      description: '企业级安全标准，保护您的数据和业务资产',
      icon: 'shield-check',
      highlights: ['数据加密', '访问控制', '合规性'],
      cta: { label: '了解更多', href: '/features/secure' },
    },
  ],
};

// ============================================================================
// Cases 区块降级数据
// ============================================================================

export const FALLBACK_CASES_DATA: CasesData = {
  enabled: true,
  title: '成功案例',
  subtitle: '探索我们帮助客户实现数字化转型的成功故事',
  tagline: '客户成功是我们的使命',
  ui: {
    viewDetails: '查看详情',
  },
  items: [
    {
      id: 'case-1',
      slug: 'e-commerce-transform',
      title: '电商平台数字化转型',
      description: '帮助某大型电商平台实现全渠道销售，提升用户体验和运营效率',
      tags: ['电商', '数字化转型', '全渠道'],
      cover: {
        url: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2000&auto=format&fit=crop',
        alt: '电商平台',
      },
      publishedAt: '2023-10-15',
      cta: {
        href: '/cases/e-commerce-transform',
      },
    },
    {
      id: 'case-2',
      slug: 'enterprise-data',
      title: '企业数据管理优化',
      description: '为某金融企业构建统一的数据管理平台，提升数据治理能力',
      tags: ['金融', '数据管理', '治理'],
      cover: {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop',
        alt: '数据管理',
      },
      publishedAt: '2023-09-22',
      cta: {
        href: '/cases/enterprise-data',
      },
    },
    {
      id: 'case-3',
      slug: 'healthcare-innovation',
      title: '医疗健康创新',
      description: '为医疗机构提供智能化解决方案，提升诊疗效率和患者体验',
      tags: ['医疗', 'AI', '智能化'],
      cover: {
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop',
        alt: '医疗健康',
      },
      publishedAt: '2023-08-18',
      cta: {
        href: '/cases/healthcare-innovation',
      },
    },
  ],
};

// ============================================================================
// CTA 区块降级数据
// ============================================================================

export const FALLBACK_CTA_DATA: CTAData = {
  enabled: true,
  title: '准备好开始了吗？',
  subtitle: '联系我们，了解如何为您的业务提供支持',
  actions: [
    {
      label: '立即咨询',
      href: '/contact',
      variant: 'primary',
    },
    {
      label: '查看文档',
      href: '/docs',
      variant: 'secondary',
    },
  ],
  contact: {
    description: '如有问题，请随时联系我们',
    email: {
      value: 'contact@vxture.com',
    },
    phone: {
      value: '+86 400-123-4567',
    },
  },
};

// ============================================================================
// Solutions 区块降级数据
// ============================================================================

export const FALLBACK_SOLUTIONS_DATA: SolutionsData = {
  enabled: true,
  title: '解决方案',
  subtitle: '为不同行业提供定制化的解决方案',
  tagline: '探索我们的成功案例',
  items: [
    {
      id: 'solution-1',
      slug: 'enterprise-solution',
      title: '企业解决方案',
      subtitle: '全方位的企业管理平台',
      description: '为大型企业提供完整的数字化转型方案，包括资源管理、流程优化、数据分析等核心功能',
      tags: ['企业级', '资源管理', '流程优化', '数据分析'],
      cover: {
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop',
        alt: '企业解决方案',
      },
      theme: 'primary',
      cta: { href: '/solutions/enterprise' },
    },
    {
      id: 'solution-2',
      slug: 'education-solution',
      title: '教育解决方案',
      subtitle: '智能教育平台',
      description: '为教育机构提供在线学习平台、教学管理系统、数据分析工具等，提升教学质量和效率',
      tags: ['在线学习', '教学管理', '数据分析', '智能评测'],
      cover: {
        url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2000&auto=format&fit=crop',
        alt: '教育解决方案',
      },
      theme: 'brand',
      cta: { href: '/solutions/education' },
    },
    {
      id: 'solution-3',
      slug: 'healthcare-solution',
      title: '医疗解决方案',
      subtitle: '智能医疗系统',
      description: '为医疗机构提供电子病历、远程诊断、数据分析等功能，提升医疗服务质量和效率',
      tags: ['电子病历', '远程诊断', '数据分析', '健康管理'],
      cover: {
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop',
        alt: '医疗解决方案',
      },
      theme: 'success',
      cta: { href: '/solutions/healthcare' },
    },
  ],
  ui: {
    viewDetails: '查看详情',
    prev: '上一项',
    next: '下一项',
  },
  featuresTitle: '核心功能',
};

// ============================================================================
// 聚合导出：首页完整降级数据
// ============================================================================

/**
 * 首页完整降级数据
 *
 * 使用示例：
 * ```ts
 * import { homepageFallback } from '@/fallback/homepage.fallback';
 *
 * const { data, error } = useQuery({
 *   queryFn: () => homepageApi.getHomepage(),
 *   // 接口失败时用 fallback 数据，页面不空白
 *   placeholderData: homepageFallback,
 * });
 *
 * return data ?? homepageFallback;
 * ```
 */
export const homepageFallback = {
  hero: FALLBACK_HERO_DATA,
  features: FALLBACK_FEATURES_DATA,
  cases: FALLBACK_CASES_DATA,
  cta: FALLBACK_CTA_DATA,
  solutions: FALLBACK_SOLUTIONS_DATA,
};
