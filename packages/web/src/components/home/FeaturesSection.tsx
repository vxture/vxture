/**
 * FeaturesSection.tsx
 *
 * 功能：
 * - 首页核心能力区块，展示企业/平台特色能力
 * - 支持吸附滚动、外部数据驱动、响应式布局
 *
 * 用途：
 * - 作为首页核心能力展示区，提升品牌专业形象与信任度
 * - 结构与其它 Section 组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 TailwindCSS、Next.js、react-icons
 * - 被 app/(main)/page.tsx 直接引用
 *
 * 设计规范：
 * - 只负责 UI 展示与交互，不包含业务逻辑
 * - 命名、结构、注释与其它 Section 组件保持一致
 *
 * @file FeaturesSection.tsx
 * @desc 首页核心能力区块，支持吸附滚动与数据驱动
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, TailwindCSS, react-icons
 * @tags home, features, section, component
 * @example
 *   <FeaturesSection />
 * @remarks
 * - 仅负责 UI 展示，业务逻辑请移至上层页面/服务。
 * @todo
 *   支持更多动态内容与动画效果
 */
'use client';
/**
 * FeaturesSection.tsx
 *
 * 功能：
 * - 首页核心能力区块，展示企业/平台特色能力
 * - 支持吸附滚动、外部数据驱动、响应式布局
 *
 * 用途：
 * - 作为首页核心能力展示区，提升品牌专业形象与信任度
 * - 结构与其它 Section 组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 TailwindCSS、Next.js、react-icons
 * - 被 app/(main)/page.tsx 直接引用
 *
 * 设计规范：
 * - 只负责 UI 展示与交互，不包含业务逻辑
 * - 命名、结构、注释与其它 Section 组件保持一致
 *
 * @file FeaturesSection.tsx
 * @desc 首页核心能力区块，支持吸附滚动与数据驱动
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, TailwindCSS, react-icons
 * @tags home, features, section, component
 * @example
 *   <FeaturesSection />
 * @remarks
 *   仅负责 UI 展示，业务逻辑请移至上层页面/服务。
 * @todo
 *   支持更多动态内容与动画效果
 */
'use client';

import { memo } from 'react';
import { GiPathDistance } from 'react-icons/gi';
import { PiGraphFill } from 'react-icons/pi';
import { SiCodeceptjs } from 'react-icons/si';
import { FaMedal } from 'react-icons/fa6';
import { HiArrowLongRight } from 'react-icons/hi2';
import { BasicColorMap, SectionTheme } from '@/theme/colorMap';

// 1. 单个能力项类型定义
interface FeatureContext {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  iconFeature: React.ReactNode;
  highlightsFeature: string[];
  moreButtonFeature: string;
  colorFeature?: string;
}

// 2. 能力区块数据类型定义
interface FeaturesSectionData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconSection: React.ReactNode;
  moreButtonSection: string;
  bottomTextSection: string;
  features: FeatureContext[];
  colorSection: typeof BasicColorMap;
}

// 3. 能力区块展示内容数据（便于后续数据库/接口扩展）
const featuresSectionData: FeaturesSectionData = {
  id: 'replace by props',
  title: '核心能力',
  subtitle: '专注为政府和大型企事业单位，提供数据驱动的智能决策业务重构和升级',
  description: 'none',
  iconSection: <FaMedal />,
  moreButtonSection: '了解更多section',
  bottomTextSection: '数据驱动，智能决策',
  colorSection: BasicColorMap,

  /**
 * FeaturesSection.tsx
 *


 * @file FeaturesSection.tsx
 * @desc 首页核心能力区块，支持吸附滚动与数据驱动
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, TailwindCSS, react-icons
 * @tags home, features, section, component
 * @example
 *   <FeaturesSection />
 * @remarks
 *   仅负责 UI 展示，业务逻辑请移至上层页面/服务。
 * @todo
 *   支持更多动态内容与动画效果
 */
  features: [
    {
      id: 'feature-1',
      title: '数据图谱构建',
      subtitle: 'subtitletest-1',
      description:
        '多源数据融合，自动构建知识图谱，让海量数据形成智能化的关联网络，发现数据间的隐藏价值和深层关系。',
      iconFeature: <PiGraphFill />,
      highlightsFeature: ['多源数据融合', '知识图谱构建', '关联关系挖掘'],
      moreButtonFeature: '了解更多1',
      colorFeature: 'primary',
    },
    {
      id: 'feature-2',
      title: '智能决策调度',
      subtitle: 'subtitletest-2',
      description:
        'AI 驱动的资源优化与任务调度，通过机器学习算法实现智能化的资源分配，提升运营效率和决策质量。',
      iconFeature: <GiPathDistance />,
      highlightsFeature: ['AI 智能调度', '资源优化配置', '决策质量提升'],
      moreButtonFeature: '了解更多2',
      colorFeature: 'primary',
    },
    {
      id: 'feature-3',
      title: '孪生仿真推演',
      subtitle: 'subtitletest-2',
      description:
        '数字孪生建模，预测未来趋势，通过高精度仿真模型模拟各种场景，为战略决策提供科学依据。',
      iconFeature: <SiCodeceptjs />,
      highlightsFeature: ['数字孪生建模', '场景仿真推演', '预测分析能力'],
      moreButtonFeature: '了解更多3',
      colorFeature: 'primary',
    },
  ],
};

// 4. 单个能力卡片组件
// 性能优化：React.memo
// 提取 colors 为 props，支持主题和字段语义化
interface FeatureCardProps {
  feature: FeatureContext;
  theme?: SectionTheme;
  sectionIcon: React.ReactNode;
  moreButtonSection: string;
}
const FeatureCard = memo(function FeatureCard({
  feature,
  theme = 'light',
  sectionIcon,
  moreButtonSection,
}: FeatureCardProps) {
  // 根据 feature.colorFeature 动态获取对应色板
  const colorKey = feature.colorFeature as keyof (typeof BasicColorMap)[typeof theme];
  const colorsCards = BasicColorMap[theme][colorKey || 'primary'];
  // section 区块色板可根据需要选择主色
  const colorsSection = BasicColorMap[theme].primary;
  return (
    <div
      className={`group relative flex flex-col ${colorsCards.bgCard} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105`}
    >
      {/* 顶部与底部装饰条 */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colorsCards.borderDecorative}`} />
      <div className={`absolute bottom-0 left-0 w-full h-1 ${colorsCards.borderDecorative}`} />
      {/* 右上角奖牌图标 */}
      <span
        className={`absolute top-4 right-4 flex items-center justify-center w-8 h-8 transition-colors duration-300 ${colorsSection.iconMain}`}
      >
        <div className='w-6 h-6 transition-colors duration-300'>{sectionIcon}</div>
      </span>
      {/* 卡片内容区 */}
      <div className='relative flex flex-col flex-1 p-8 space-y-6 z-10'>
        {/* 主图标 */}
        <div className='flex justify-center'>
          <div
            className={`w-20 h-20 ${colorsCards.iconMain} rounded-2xl flex items-center justify-center transition-transform duration-300 border`}
          >
            {feature.iconFeature}
          </div>
        </div>
        {/* 标题 */}
        <h3 className={`text-2xl font-bold text-center ${colorsCards.textMain}`}>
          {feature.title}
        </h3>
        {/* 描述 */}
        <p className={`leading-relaxed text-center ${colorsCards.textDesc}`}>
          {feature.description}
        </p>
        {/* 高亮标签 */}
        <div className='flex flex-wrap gap-2 justify-center'>
          {feature.highlightsFeature.map((highlight) => (
            <span
              key={highlight}
              className={`px-3 py-1 text-sm font-semibold rounded-full border ${colorsCards.tagBg} ${colorsCards.tagText}`}
            >
              {highlight}
            </span>
          ))}
        </div>
        {/* 了解更多按钮 */}
        <div className='flex flex-1 items-end'>
          <div className='w-full text-center'>
            <button
              className={`inline-flex items-center px-6 py-2 rounded-lg transition-all duration-300 border ${colorsCards.bgButton} ${colorsCards.textButton} ${colorsCards.bgButtonHover} ${colorsCards.borderButton}`}
            >
              <span>{moreButtonSection}</span>
              <span>{feature.moreButtonFeature}</span>
              <HiArrowLongRight className='ml-2 w-4 h-4 transition-colors' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// 5. 能力区块主组件
// 性能优化：React.memo
// 提取 colors 为 props，支持主题和字段语义化
interface FeaturesSectionProps {
  id: string;
  theme?: SectionTheme;
  // data 可选：若未传入则使用库内的默认数据 featuresSectionData
  data?: FeaturesSectionData;
}
const FeaturesSection = memo(function FeaturesSection({
  id,
  theme = 'light',
  data,
}: FeaturesSectionProps) {
  const {
    title,
    subtitle,
    description,
    iconSection,
    moreButtonSection,
    bottomTextSection,
    features,
  } = data || featuresSectionData;
  // 区块主色板
  const colors = BasicColorMap[theme].primary;
  return (
    <section id={id} className={`relative snap-section pt-32 ${colors.bgSection}`}>
      <div className='h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* 标题区 */}
        <div className='text-center mb-16'>
          <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${colors.textMain}`}>{title}</h2>
          <p className={`text-lg max-w-4xl mx-auto ${colors.textSub}`}>{subtitle}</p>
          <p className={`text-md max-w-4xl mx-auto mt-4 ${colors.textDesc}`}>{description}</p>
        </div>
        {/* 能力卡片网格 */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              theme={theme}
              sectionIcon={iconSection}
              moreButtonSection={moreButtonSection}
            />
          ))}
        </div>
        {/* 底部装饰文本 */}
        <div className='text-center my-16'>
          <div className='inline-flex items-center space-x-2'>
            <div className={`w-8 h-[1px] ${colors.dividerRight}`}></div>
            <span className={`text-sm font-medium ${colors.textSub}`}>{moreButtonSection}</span>
            <span className={`text-sm font-medium ${colors.textSub}`}>{bottomTextSection}</span>
            <div className={`w-8 h-[1px] ${colors.dividerLeft}`}></div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FeaturesSection;
