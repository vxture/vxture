/**
 * FeaturesSection.tsx - 首页核心能力区块（重构版）
 *
 * 功能：展示首页 Features 区块 UI，支持吸附滚动、响应式布局、主题切换
 *
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2026-03-04
 * @version 2.1.0
 * @copyright Copyright (c) 2024-2026 Vxture Team
 * @license MIT
 *
 * @layer Presentation
 * @category Components - Home
 */
'use client';

import { memo } from 'react';
import { useFeatures } from '@/hooks';
import { debugLog } from '@vxture/shared';
import { Icon } from '@vxture/design-system';

// ============================================================================
// 类型定义
// ============================================================================

type SectionTheme = 'light' | 'dark';

interface BasicColorMapType {
  [key: string]: {
    primary: {
      bgCard: string;
      borderDecorative: string;
      iconMain: string;
      textMain: string;
      textDesc: string;
      textSub: string;
      tagBg: string;
      tagText: string;
      bgSection: string;
    };
  };
}

const BasicColorMap: BasicColorMapType = {
  light: {
    primary: {
      bgCard: 'bg-white',
      borderDecorative: 'bg-blue-200',
      iconMain: 'bg-gradient-to-r from-blue-50 to-blue-100',
      textMain: 'text-blue-800',
      textDesc: 'text-gray-600',
      textSub: 'text-blue-600',
      tagBg: 'bg-blue-50',
      tagText: 'text-blue-600',
      bgSection: 'bg-gradient-to-b from-blue-50 to-white',
    },
  },
  dark: {
    primary: {
      bgCard: 'bg-slate-800',
      borderDecorative: 'bg-blue-400',
      iconMain: 'bg-gradient-to-r from-blue-600 to-blue-700',
      textMain: 'text-blue-200',
      textDesc: 'text-slate-400',
      textSub: 'text-blue-400',
      tagBg: 'bg-blue-900/30',
      tagText: 'text-blue-300',
      bgSection: 'bg-gradient-to-b from-slate-900 to-slate-800',
    },
  },
};

/**
 * 单个能力卡片 Props
 */
interface FeatureCardProps {
  readonly feature: {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly icon?: string;
    readonly highlights: readonly string[];
    readonly cta: { readonly label: string; readonly href: string };
  };
  readonly theme?: SectionTheme;
}

/**
 * 能力区块主组件 Props
 */
interface FeaturesSectionProps {
  readonly id: string;
  readonly name?: string;
  readonly theme?: SectionTheme;
}

// ============================================================================
// 子组件定义
// ============================================================================

/**
 * 单个能力卡片组件
 */
const FeatureCard = memo(function FeatureCard({
  feature,
  theme = 'light',
}: FeatureCardProps) {
  // ==========================================================================
  // 计算属性
  // ==========================================================================

  const colorsCards = (BasicColorMap[theme]?.primary || BasicColorMap['light']?.primary) || {
    bgCard: 'bg-white',
    borderDecorative: 'bg-blue-200',
    iconMain: 'bg-gradient-to-r from-blue-50 to-blue-100',
    textMain: 'text-blue-800',
    textDesc: 'text-gray-600',
    textSub: 'text-blue-600',
    tagBg: 'bg-blue-50',
    tagText: 'text-blue-600',
    bgSection: 'bg-gradient-to-b from-blue-50 to-white',
  };

  // ==========================================================================
  // 渲染
  // ==========================================================================

  return (
    <div
      className={`group relative flex flex-col ${colorsCards.bgCard} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 h-full`}
    >
      {/* 顶部与底部装饰条 */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colorsCards.borderDecorative}`} />
      <div className={`absolute bottom-0 left-0 w-full h-1 ${colorsCards.borderDecorative}`} />

      {/* 右上角图标 */}
      <div className='absolute top-4 right-4 flex items-center justify-center w-8 h-8'>
        <Icon name='medal' className='w-5 h-5 text-blue-500' />
      </div>

      {/* 卡片内容区 */}
      <div className='relative flex flex-col flex-1 p-8 space-y-8 z-10'>
        {/* 主图标 */}
        {feature.icon && (
          <div className='flex justify-center'>
            <div
              className={`w-24 h-24 ${colorsCards.iconMain} rounded-2xl flex items-center justify-center transition-transform duration-300 border-0`}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Icon name={feature.icon as any} fallback='placeholder' className='w-16 h-16' />
            </div>
          </div>
        )}

        {/* 标题 */}
        <h3 className={`text-2xl font-bold text-center ${colorsCards.textMain}`}>
          {feature.title}
        </h3>

        {/* 描述 */}
        <p className={`leading-relaxed text-center text-base ${colorsCards.textDesc}`}>
          {feature.description}
        </p>

        {/* 高亮标签 */}
        {feature.highlights && feature.highlights.length > 0 && (
          <div className='flex flex-wrap gap-3 justify-center'>
            {feature.highlights.map((highlight) => (
              <span
                key={highlight}
                className={`px-3 py-1 text-sm font-semibold rounded-full border ${colorsCards.tagBg} ${colorsCards.tagText}`}
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        {/* 了解更多按钮 */}
        <div className='flex flex-1 items-end'>
          <div className='w-full text-center'>
            <a
              href={feature.cta.href}
              className={`inline-flex items-center px-4 py-1.5 text-sm rounded-md transition-all duration-300 ${colorsCards.textSub} hover:${colorsCards.textMain} opacity-70 hover:opacity-100`}
            >
              <span>{feature.cta.label}</span>
              <Icon name='arrow-long-right' className='ml-1.5 w-3.5 h-3.5 transition-all' />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// 主组件实现
// ============================================================================

/**
 * 能力区块主组件
 */
const FeaturesSection = memo(function FeaturesSection({
  id,
  name = 'Features',
  theme = 'light',
}: FeaturesSectionProps) {
  // ==========================================================================
  // Hooks 调用
  // ==========================================================================

  const { data: displayData, isLoading, error } = useFeatures();

  // 调试日志（方案 A：直接在组件里，生产环境自动禁用）
  debugLog('Features data:', displayData);
  debugLog('Features error:', error);
  debugLog('Features isLoading:', isLoading);

  // ==========================================================================
  // 计算属性
  // ==========================================================================

  const colors = (BasicColorMap[theme]?.primary || BasicColorMap['light']?.primary) || {
    bgCard: 'bg-white',
    borderDecorative: 'bg-blue-200',
    iconMain: 'bg-gradient-to-r from-blue-50 to-blue-100',
    textMain: 'text-blue-800',
    textDesc: 'text-gray-600',
    textSub: 'text-blue-600',
    tagBg: 'bg-blue-50',
    tagText: 'text-blue-600',
    bgSection: 'bg-gradient-to-b from-blue-50 to-white',
  };

  // ==========================================================================
  // 早期返回
  // ==========================================================================

  // 加载状态
  if (isLoading) {
    return (
      <section
        id={id}
        data-name={name}
        className={`relative snap-section min-h-screen flex items-center justify-center ${colors.bgSection}`}
      >
        <div className='text-center'>
          <div className={`text-xl ${colors.textMain}`}>加载中...</div>
        </div>
      </section>
    );
  }

  // 如果内容被禁用，不渲染
  if (!displayData.enabled) {
    return null;
  }

  // ==========================================================================
  // 渲染
  // ==========================================================================

  const { title, subtitle, tagline, items } = displayData;

  return (
    <section
      id={id}
      data-name={name}
      className={`relative snap-section min-h-screen flex flex-col ${colors.bgSection}`}
    >
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen'>
        {/* 1. 标题区 - 靠上对齐 */}
        <div className='text-center pt-28'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-800 mb-4'>{title}</h2>
          {subtitle && <p className='text-lg text-gray-600 max-w-4xl mx-auto'>{subtitle}</p>}
        </div>

        {/* 2. 内容区 - 上下居中 */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-full'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-8'>
              {items.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} theme={theme} />
              ))}
            </div>
          </div>
        </div>

        {/* 3. 底部区 - 靠下对齐 */}
        {tagline && (
          <div className='text-center pb-12'>
            <div className='inline-flex items-center space-x-2'>
              <div className='w-8 h-[2px] bg-gradient-to-r from-transparent to-blue-200'></div>
              <span className='text-sm font-medium text-blue-500'>{tagline}</span>
              <div className='w-8 h-[2px] bg-gradient-to-l from-transparent to-blue-200'></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default FeaturesSection;
