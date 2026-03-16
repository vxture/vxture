/**
 * 案例库数据 - 不包含翻译文本，只定义结构
 * @package @vxture/website
 * @layer Presentation
 * @category Data - Cases
 */

/**
 * 案例封面配置
 */
export interface CaseCover {
  url: string;
}

/**
 * 案例 CTA 配置
 */
export interface CaseCta {
  href: string;
}

/**
 * 案例标签配置
 */
export interface CaseTag {
  id: string;
  name: string;
  slug: string;
}

/**
 * 案例详细信息
 */
export interface CaseItem {
  /** 案例唯一标识 */
  id: string;
  /** URL友好的唯一标识符（跟随案例变化） */
  slug: string;
  /** 发布时间 */
  publishedAt: string;
  /** 主题样式 */
  theme: string;
  /** 内容意图 */
  intent: string;
  /** 展示变体 */
  variant: string;
  /** 标题 */
  title: string;
  /** 副标题 */
  subtitle: string;
  /** 描述 */
  description: string;
  /** 标签 */
  tags: string[];
  /** 封面图片 */
  cover: CaseCover;
  /** 案例 CTA */
  cta: CaseCta;
}

/**
 * UI 文本配置（使用 labelKey 映射）
 */
export interface CasesUi {
  viewDetailsKey: string;
  prevKey: string;
  nextKey: string;
  filterByKey: string;
  searchKey: string;
}

/**
 * 案例完整数据结构
 */
export interface CasesData {
  enabled: boolean;
  icon: string;
  titleKey: string;
  subtitleKey: string;
  taglineKey: string;
  ui: CasesUi;
  items: CaseItem[];
  /** 筛选分类 */
  categories: {
    id: string;
    nameKey: string;
    slug: string;
  }[];
}

/**
 * 案例库数据 - JSON提供，中英文一致
 */
export const CASES_DATA: CasesData = {
  enabled: true,
  icon: "chart",
  titleKey: "cases.title",
  subtitleKey: "cases.subtitle",
  taglineKey: "cases.tagline",
  ui: {
    viewDetailsKey: "cases.ui.viewDetails",
    prevKey: "cases.ui.prev",
    nextKey: "cases.ui.next",
    filterByKey: "cases.ui.filterBy",
    searchKey: "cases.ui.search"
  },
  categories: [
    { id: "category-01", nameKey: "cases.categories.geo", slug: "geo" },
    { id: "category-02", nameKey: "cases.categories.public", slug: "public" },
    { id: "category-03", nameKey: "cases.categories.emergency", slug: "emergency" }
  ],
  items: [
    {
      id: "case-intro-01",
      slug: "geo-disaster-graph",
      publishedAt: "2024-03-01",
      theme: "success",
      intent: "case",
      variant: "card",
      title: "自然灾害监测与预警系统",
      subtitle: "基于知识图谱的自然灾害监测与预警系统",
      description: "该系统整合了多源气象、地理、地震等数据，通过知识图谱技术构建了复杂的灾害关联模型，实现了对自然灾害的实时监测、风险评估和智能预警。系统具有高精度、低延迟、可扩展性强等特点，已在多个省份的防灾减灾工作中得到应用。",
      tags: ["自然灾害", "监测预警", "知识图谱"],
      cover: {
        url: "/images/casessection/case-intro-01.jpg"
      },
      cta: {
        href: "/cases-pages/geo-disaster-graph"
      }
    },
    {
      id: "case-intro-02",
      slug: "intelligent-emergency",
      publishedAt: "2024-12-01",
      theme: "brand",
      intent: "new",
      variant: "card",
      title: "智能应急指挥系统",
      subtitle: "基于AI的应急指挥决策支持系统",
      description: "该系统采用人工智能技术，实现了应急指挥过程的自动化和智能化。通过对突发事件的分析、预测和评估，为指挥人员提供科学的决策支持。系统包含预案管理、资源调度、可视化展示等功能模块，提高了应急响应效率和指挥决策水平。",
      tags: ["应急指挥", "人工智能", "决策支持"],
      cover: {
        url: "/images/casessection/case-intro-02.jpg"
      },
      cta: {
        href: "/cases-pages/intelligent-emergency"
      }
    },
    {
      id: "case-intro-03",
      slug: "public-safety-analysis",
      publishedAt: "2025-06-01",
      theme: "info",
      intent: "featured",
      variant: "card",
      title: "公共安全风险分析系统",
      subtitle: "基于大数据的公共安全风险分析平台",
      description: "该平台整合了公安、交通、消防等多部门数据，通过大数据分析技术构建了公共安全风险评估模型。系统能够实时监测城市安全态势，识别潜在风险点，并提供预警和处置建议。为城市公共安全管理提供了科学依据，提升了城市安全保障能力。",
      tags: ["公共安全", "风险分析", "大数据"],
      cover: {
        url: "/images/casessection/case-intro-03.jpg"
      },
      cta: {
        href: "/cases-pages/public-safety-analysis"
      }
    },
    {
      id: "case-intro-04",
      slug: "environmental-monitoring",
      publishedAt: "2025-09-15",
      theme: "primary",
      intent: "case",
      variant: "card",
      title: "生态环境监测系统",
      subtitle: "基于物联网的生态环境监测与管理平台",
      description: "该系统通过部署物联网感知设备，实时采集空气、水、土壤等环境数据。利用大数据分析和人工智能技术，实现了环境质量的监测、预警和管理。系统包含数据可视化、趋势分析、异常检测等功能，为环境保护决策提供了有力支持。",
      tags: ["环境保护", "物联网", "数据分析"],
      cover: {
        url: "/images/casessection/case-intro-04.jpg"
      },
      cta: {
        href: "/cases-pages/environmental-monitoring"
      }
    },
    {
      id: "case-intro-05",
      slug: "transportation-simulation",
      publishedAt: "2025-12-01",
      theme: "success",
      intent: "new",
      variant: "card",
      title: "交通系统仿真分析平台",
      subtitle: "基于数字孪生的交通系统仿真与优化",
      description: "该平台采用数字孪生技术，构建了城市交通系统的虚拟模型。通过模拟交通流量、优化交通信号、预测拥堵状况，实现了交通系统的智能化管理。平台支持多种交通场景模拟，为交通规划和管理提供了科学依据，提升了城市交通运行效率。",
      tags: ["交通管理", "数字孪生", "仿真优化"],
      cover: {
        url: "/images/casessection/case-intro-05.jpg"
      },
      cta: {
        href: "/cases-pages/transportation-simulation"
      }
    },
    {
      id: "case-intro-06",
      slug: "healthcare-intelligent",
      publishedAt: "2026-02-15",
      theme: "info",
      intent: "featured",
      variant: "card",
      title: "智慧医疗解决方案",
      subtitle: "基于AI的智慧医疗服务平台",
      description: "该平台整合了医院信息系统、电子病历、医疗设备等数据资源。通过人工智能技术实现了智能诊断、健康管理、远程医疗等功能。系统能够提高医疗服务效率，降低医疗成本，为患者提供更加便捷和个性化的医疗服务。",
      tags: ["智慧医疗", "人工智能", "健康管理"],
      cover: {
        url: "/images/casessection/case-intro-06.jpg"
      },
      cta: {
        href: "/cases-pages/healthcare-intelligent"
      }
    }
  ]
};
