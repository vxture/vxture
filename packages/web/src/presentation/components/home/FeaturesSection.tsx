/**
 * FeaturesSection.tsx - 首页核心能力区块（重构版）
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示首页 Features 区块 UI
 * - 使用 Application Layer 的 useFeatures Hook 获取数据
 * - 支持吸附滚动、响应式布局、主题切换
 *
 * @layer Presentation
 * @category Components - Home
 */
'use client';

import { memo } from 'react';
import { useFeatures } from '@/application/hooks/homepage';
import { HiArrowLongRight } from 'react-icons/hi2';
import { FaMedal } from 'react-icons/fa';
import { BasicColorMap, SectionTheme } from '@/shared/theme/colorMap';
import { renderIcon } from '@/shared/utils/iconMapper';

// 单个能力卡片组件
interface FeatureCardProps {
  feature: {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    highlights: string[];
    cta: { label: string; href: string };
  };
  theme?: SectionTheme;
}

const FeatureCard = memo(function FeatureCard({
  feature,
  theme = 'light',
}: FeatureCardProps) {
  const colorsCards = BasicColorMap[theme].primary;

  return (
    <div
      className={`group relative flex flex-col ${colorsCards.bgCard} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105`}
    >
      {/* 顶部与底部装饰条 */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colorsCards.borderDecorative}`} />
      <div className={`absolute bottom-0 left-0 w-full h-1 ${colorsCards.borderDecorative}`} />

      {/* 右上角图标 */}
      <div className='absolute top-4 right-4 flex items-center justify-center w-8 h-8'>
        <FaMedal className='w-5 h-5 text-blue-500' />
      </div>

      {/* 卡片内容区 */}
      <div className='relative flex flex-col flex-1 p-8 space-y-8 z-10'>
        {/* 主图标 */}
        {feature.icon && (
          <div className='flex justify-center'>
            <div
              className={`w-24 h-24 ${colorsCards.iconMain} rounded-2xl flex items-center justify-center transition-transform duration-300 border-0`}
            >
              {renderIcon(feature.icon, 'w-16 h-16')}
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
              <HiArrowLongRight className='ml-1.5 w-3.5 h-3.5 transition-all' />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

// 能力区块主组件
interface FeaturesSectionProps {
  id: string;
  theme?: SectionTheme;
}

const FeaturesSection = memo(function FeaturesSection({
  id,
  theme = 'light',
}: FeaturesSectionProps) {
  // 使用新的 Application Layer Hook 获取数据
  const { data: featuresData, isLoading, error } = useFeatures();

  const colors = BasicColorMap[theme].primary;

  // 加载状态
  if (isLoading) {
    return (
      <section id={id} className={`relative snap-section min-h-screen flex items-center justify-center ${colors.bgSection}`}>
        <div className='text-center'>
          <div className={`text-xl ${colors.textMain}`}>加载中...</div>
        </div>
      </section>
    );
  }

  // 错误状态
  if (error || !featuresData) {
    return (
      <section id={id} className={`relative snap-section min-h-screen flex items-center justify-center ${colors.bgSection}`}>
        <div className='text-center'>
          <div className={`text-xl ${colors.textMain}`}>加载失败</div>
        </div>
      </section>
    );
  }

  // 如果内容被禁用，不渲染
  if (!featuresData.enabled) {
    return null;
  }

  const { title, subtitle, tagline, items } = featuresData;

  return (
    <section id='snap-section-2' className={`relative snap-section min-h-screen flex flex-col ${colors.bgSection}`}>
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen'>
        {/* 1. 标题区 - 靠上对齐 */}
        <div className='text-center pt-28'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-800 mb-4'>{title}</h2>
          {subtitle && (
            <p className='text-lg text-gray-600 max-w-4xl mx-auto'>{subtitle}</p>
          )}
        </div>

        {/* 2. 内容区 - 上下居中 */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-full'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-8'>
              {items.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. 底部区 - 靠下对齐 */}
        {tagline && (
          <div className='text-center pb-20'>
            <div className='inline-flex items-center space-x-2'>
              <div className={`w-8 h-[1px] ${colors.dividerRight}`}></div>
              <span className={`text-sm font-medium ${colors.textSub}`}>{tagline}</span>
              <div className={`w-8 h-[1px] ${colors.dividerLeft}`}></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default FeaturesSection;
