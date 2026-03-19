/**
 * FeaturesSection.tsx - 首页核心能力区块（重构版）
 *
 * 功能：展示首页 Features 区块 UI，支持吸附滚动、响应式布局、主题切换
 *
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2026-03-19
 * @version 2.2.0
 * @copyright Copyright (c) 2024-2026 Vxture Team
 * @license MIT
 *
 * @layer Presentation
 * @category Components - Home
 */
'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { debugLog } from '@vxture/shared';
import { Icon } from '@vxture/design-system';
import { FEATURES_DATA } from '@/data/home/home.features.data';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 单个能力卡片 Props
 */
interface FeatureCardProps {
  readonly feature: {
    readonly id: string;
    readonly slug: string;
    readonly highlights: readonly string[];
    readonly cta: { readonly href: string };
  };
}

/**
 * 能力区块主组件 Props
 */
interface FeaturesSectionProps {
  readonly id: string;
  readonly name?: string;
}

// ============================================================================
// 子组件定义
// ============================================================================

/**
 * 单个能力卡片组件
 *
 * 统一色值规范：
 *   light: 卡片白底，蓝色标题，灰色描述，蓝色标签
 *   dark:  卡片 slate-700，蓝色浅标题，slate-300 描述，蓝色浅标签
 */
const FeatureCard = memo(function FeatureCard({ feature }: FeatureCardProps) {
  const t = useTranslations('home.features');

  return (
    <div className='group relative flex flex-col bg-white dark:bg-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 h-full'>
      {/* 顶部与底部装饰条 */}
      <div className='absolute top-0 left-0 w-full h-1 bg-blue-300 dark:bg-blue-400' />
      <div className='absolute bottom-0 left-0 w-full h-1 bg-blue-300 dark:bg-blue-400' />

      {/* 右上角图标 */}
      <div className='absolute top-4 right-4 flex items-center justify-center w-8 h-8'>
        <Icon name='medal' className='w-5 h-5 text-blue-400 dark:text-blue-300' />
      </div>

      {/* 卡片内容区 */}
      <div className='relative flex flex-col flex-1 p-8 space-y-8 z-10'>
        {/* 主图标 */}
        <div className='flex justify-center'>
          <div className='w-24 h-24 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-600/40 dark:to-blue-700/40 rounded-2xl flex items-center justify-center transition-transform duration-300 border-0'>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Icon name={t(`items.${feature.id}.icon`) as any} fallback='placeholder' className='w-16 h-16' />
          </div>
        </div>

        {/* 标题 */}
        <h3 className='text-2xl font-bold text-center text-blue-700 dark:text-blue-200'>
          {t(`items.${feature.id}.title`)}
        </h3>

        {/* 描述 */}
        <p className='leading-relaxed text-center text-base text-gray-600 dark:text-slate-300'>
          {t(`items.${feature.id}.description`)}
        </p>

        {/* 高亮标签 */}
        {feature.highlights && feature.highlights.length > 0 && (
          <div className='flex flex-wrap gap-3 justify-center'>
            {feature.highlights.map((highlightKey, index) => (
              <span
                key={highlightKey}
                className='px-3 py-1 text-sm font-semibold rounded-full border bg-blue-50 dark:bg-blue-800/40 text-blue-600 dark:text-blue-200 border-blue-100 dark:border-blue-700/50'
              >
                {t(`items.${feature.id}.highlights.${index}`)}
              </span>
            ))}
          </div>
        )}

        {/* 了解更多按钮 */}
        <div className='flex flex-1 items-end'>
          <div className='w-full text-center'>
            <a
              href={feature.cta.href}
              className='inline-flex items-center px-4 py-1.5 text-sm rounded-md transition-all duration-300 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 opacity-70 hover:opacity-100'
            >
              <span>{t(`items.${feature.id}.cta.label`)}</span>
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
 *
 * 背景渐变：section 2（Features）
 *   light: from-white to-blue-50   （上接 Hero 白底，向下过渡到浅蓝）
 *   dark:  from-slate-800 to-slate-700
 */
const FeaturesSection = memo(function FeaturesSection({
  id,
  name = 'Features',
}: FeaturesSectionProps) {
  const t = useTranslations('home.features');

  debugLog('Features data:', FEATURES_DATA);

  if (!FEATURES_DATA.enabled) {
    return null;
  }

  return (
    <section
      id={id}
      data-name={name}
      className='relative snap-section min-h-screen flex flex-col bg-linear-to-br from-blue-100 to-white dark:from-slate-800 dark:to-slate-700'
    >
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen'>
        {/* 1. 标题区 */}
        <div className='text-center pt-28'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-700 dark:text-blue-200 mb-4'>{t('title')}</h2>
          {t('subtitle') && (
            <p className='text-lg text-gray-600 dark:text-slate-300 max-w-4xl mx-auto'>{t('subtitle')}</p>
          )}
        </div>

        {/* 2. 内容区 */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-full'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-8'>
              {FEATURES_DATA.items.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        </div>

        {/* 3. 底部 tagline */}
        {t('tagline') && (
          <div className='text-center pb-12'>
            <div className='inline-flex items-center space-x-2'>
              <div className='w-8 h-0.5 bg-linear-to-r from-transparent to-blue-200 dark:to-blue-600'></div>
              <span className='text-sm font-medium text-blue-500 dark:text-blue-300'>{t('tagline')}</span>
              <div className='w-8 h-0.5 bg-linear-to-l from-transparent to-blue-200 dark:to-blue-600'></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default FeaturesSection;
