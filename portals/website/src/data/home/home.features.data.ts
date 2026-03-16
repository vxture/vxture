/**
 * Features 结构数据 - 不包含翻译文本，只定义结构
 * @package @vxture/website
 * @layer Presentation
 * @category Data - Home
 */

/**
 * 功能特性 CTA 配置
 */
export interface FeatureCta {
  href: string;
}

/**
 * 单个功能特性数据结构
 */
export interface FeatureItem {
  id: string;
  slug: string;
  icon: string;
  intent: string;
  theme: string;
  variant: string;
  highlights: string[];
  cta: FeatureCta;
}

/**
 * Features 完整数据结构
 */
export interface FeaturesData {
  enabled: boolean;
  icon: string;
  titleKey: string;
  subtitleKey: string;
  taglineKey: string;
  items: FeatureItem[];
}

/**
 * Features 结构数据 - 使用 labelKey 映射翻译
 */
export const FEATURES_DATA: FeaturesData = {
  enabled: true,
  icon: "chart",
  titleKey: "home.features.title",
  subtitleKey: "home.features.subtitle",
  taglineKey: "home.features.tagline",
  items: [
    {
      id: "feature-intro-01",
      slug: "data-knowledge-graph",
      icon: "graph",
      intent: "simulation",
      theme: "primary",
      variant: "card",
      highlights: ["home.features.items.feature-intro-01.highlights.0", "home.features.items.feature-intro-01.highlights.1", "home.features.items.feature-intro-01.highlights.2"],
      cta: {
        href: "/features/data-knowledge-graph"
      }
    },
    {
      id: "feature-intro-02",
      slug: "intelligent-decision-dispatch",
      icon: "sparkles",
      intent: "solution",
      theme: "primary",
      variant: "card",
      highlights: ["home.features.items.feature-intro-02.highlights.0", "home.features.items.feature-intro-02.highlights.1", "home.features.items.feature-intro-02.highlights.2"],
      cta: {
        href: "/features/intelligent-decision-dispatch"
      }
    },
    {
      id: "feature-intro-03",
      slug: "digital-twin-simulation",
      icon: "cube",
      intent: "simulation",
      theme: "primary",
      variant: "card",
      highlights: ["home.features.items.feature-intro-03.highlights.0", "home.features.items.feature-intro-03.highlights.1", "home.features.items.feature-intro-03.highlights.2"],
      cta: {
        href: "/features/digital-twin-simulation"
      }
    }
  ]
};
