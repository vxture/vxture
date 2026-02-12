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
import { BasicColorMap, SectionTheme } from '@/shared/theme/colorMap';

// 单个能力卡片组件
interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon?: string;
    tags?: string[];
  };
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
  const colorsCards = BasicColorMap[theme].primary;
  const colorsSection = BasicColorMap[theme].primary;

  return (
    <div
      className={`group relative flex flex-col ${colorsCards.bgCard} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105`}
    >
      {/* 顶部与底部装饰条 */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colorsCards.borderDecorative}`} />
      <div className={`absolute bottom-0 left-0 w-full h-1 ${colorsCards.borderDecorative}`} />

      {/* 右上角图标 */}
      <span
        className={`absolute top-4 right-4 flex items-center justify-center w-8 h-8 transition-colors duration-300 ${colorsSection.iconMain}`}
      >
        <div className='w-6 h-6 transition-colors duration-300'>{sectionIcon}</div>
      </span>

      {/* 卡片内容区 */}
      <div className='relative flex flex-col flex-1 p-8 space-y-6 z-10'>
        {/* 主图标 */}
        {feature.icon && (
          <div className='flex justify-center'>
            <div
              className={`w-20 h-20 ${colorsCards.iconMain} rounded-2xl flex items-center justify-center transition-transform duration-300 border`}
            >
              <span className='text-4xl'>{feature.icon}</span>
            </div>
          </div>
        )}

        {/* 标题 */}
        <h3 className={`text-2xl font-bold text-center ${colorsCards.textMain}`}>
          {feature.title}
        </h3>

        {/* 描述 */}
        <p className={`leading-relaxed text-center ${colorsCards.textDesc}`}>
          {feature.description}
        </p>

        {/* 高亮标签 */}
        {feature.tags && feature.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 justify-center'>
            {feature.tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 text-sm font-semibold rounded-full border ${colorsCards.tagBg} ${colorsCards.tagText}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 了解更多按钮 */}
        <div className='flex flex-1 items-end'>
          <div className='w-full text-center'>
            <button
              className={`inline-flex items-center px-6 py-2 rounded-lg transition-all duration-300 border ${colorsCards.bgButton} ${colorsCards.textButton} ${colorsCards.bgButtonHover} ${colorsCards.borderButton}`}
            >
              <span>{moreButtonSection}</span>
              <HiArrowLongRight className='ml-2 w-4 h-4 transition-colors' />
            </button>
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
      <section id={id} className={`relative snap-section pt-32 ${colors.bgSection}`}>
        <div className='h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center py-32'>
            <div className={`text-xl ${colors.textMain}`}>加载中...</div>
          </div>
        </div>
      </section>
    );
  }

  // 错误状态
  if (error || !featuresData) {
    return (
      <section id={id} className={`relative snap-section pt-32 ${colors.bgSection}`}>
        <div className='h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center py-32'>
            <div className={`text-xl ${colors.textMain}`}>加载失败</div>
          </div>
        </div>
      </section>
    );
  }

  // 如果内容被禁用，不渲染
  if (!featuresData.enabled) {
    return null;
  }

  const { title, subtitle, description, items } = featuresData;

  return (
    <section id={id} className={`relative snap-section pt-32 ${colors.bgSection}`}>
      <div className='h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* 标题区 */}
        <div className='text-center mb-16'>
          <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${colors.textMain}`}>{title}</h2>
          {subtitle && (
            <p className={`text-lg max-w-4xl mx-auto ${colors.textSub}`}>{subtitle}</p>
          )}
          {description && (
            <p className={`text-md max-w-4xl mx-auto mt-4 ${colors.textDesc}`}>{description}</p>
          )}
        </div>

        {/* 能力卡片网格 */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {items.map((feature) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              theme={theme}
              sectionIcon={<span>🏆</span>}
              moreButtonSection='了解更多'
            />
          ))}
        </div>

        {/* 底部装饰文本 */}
        <div className='text-center my-16'>
          <div className='inline-flex items-center space-x-2'>
            <div className={`w-8 h-[1px] ${colors.dividerRight}`}></div>
            <span className={`text-sm font-medium ${colors.textSub}`}>数据驱动，智能决策</span>
            <div className={`w-8 h-[1px] ${colors.dividerLeft}`}></div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FeaturesSection;