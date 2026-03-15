/**
 * CaseSection.tsx - 首页最佳实践区块（重构版）
 *
 * 功能：展示首页 Cases 区块 UI，使用 Application Layer 的 useCases Hook 获取数据，
 *      支持吸附滚动、响应式布局、案例卡片展示
 *
 * @author Stone Smoker
 * @created 2024-06-01
 * @lastModified 2026-03-03
 * @version 2.0.0
 * @copyright Copyright (c) 2024-2026 Vxture Team
 * @license MIT
 *
 * @layer Presentation
 * @category Components - Home
 */

'use client';

import Image from 'next/image';
import { Link } from '@/lib/i18n/navigation';
import { Icon } from '@vxture/design-system';
import { memo, useMemo } from 'react';
import { useCasesData } from '@/hooks';
import { debugLog } from '@vxture/shared';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 单个案例卡片 Props
 */
interface CaseCardProps {
  readonly item: {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly cover: {
      readonly url: string;
      readonly alt: string;
    };
    readonly publishedAt: string;
    readonly cta: {
      readonly href: string;
    };
  };
  readonly viewDetailsLabel: string;
}

/**
 * 案例区块主组件 Props
 */
interface CaseSectionProps {
  readonly id: string;
  readonly name?: string;
}

// ============================================================================
// 子组件定义
// ============================================================================

/**
 * 单个案例卡片组件（性能优化：React.memo）
 */
const CaseCard = memo(function CaseCard({ item, viewDetailsLabel }: CaseCardProps) {
  // ==========================================================================
  // 计算属性
  // ==========================================================================

  // 格式化日期为 YYYY/MM
  const formattedDate = useMemo(() => {
    const date = new Date(item.publishedAt);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [item.publishedAt]);

  // ==========================================================================
  // 渲染
  // ==========================================================================

  return (
    <div
      className={`group relative flex flex-col rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 h-full`}
    >
      {/* 图片区域，16:9 比例 */}
      <div className='relative w-full aspect-[16/9] flex-shrink-0'>
        <Image
          src={item.cover.url}
          alt={item.cover.alt}
          fill
          className='object-cover rounded-t-2xl'
          sizes='(max-width: 768px) 100vw, 400px'
          priority
        />
      </div>
      {/* 内容区 */}
      <div className='p-4 flex flex-col flex-grow'>
        <div className='space-y-4 flex-grow'>
          <h3 className='text-xl font-bold text-blue-800 text-left'>{item.title}</h3>
          <p className='text-sm text-gray-600 leading-relaxed text-left'>{item.description}</p>
          <div className='flex flex-wrap gap-2 justify-start'>
            {item.tags.map((tag) => (
              <span
                key={tag}
                className='px-3 py-1 bg-blue-50 text-blue-500 text-xs font-semibold rounded-full border border-blue-50'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className='mt-6 pt-3 border-t border-gray-100 flex items-center justify-between'>
          <div className='flex items-center text-gray-500 text-sm font-semibold'>
            <Icon name='calendar-days' className='mr-1.5 w-4.5 h-4.5' />
            {formattedDate}
          </div>
          <div className='flex-1 flex justify-end'>
            <Link
              href={item.cta.href}
              className='inline-flex items-center px-3 py-1 text-sm font-semibold text-gray-500 rounded-md transition-all duration-300 bg-transparent border-none shadow-none opacity-70 hover:opacity-100 group-hover:text-blue-800'
            >
              {viewDetailsLabel}
              <svg
                className='ml-1.5 w-4 h-4 transition-all'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 8l4 4m0 0l-4 4m4-4H3'
                />
              </svg>
            </Link>
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
 * 首页最佳实践区块
 */
export default function CaseSection({ id, name = 'Cases' }: CaseSectionProps) {
  // ==========================================================================
  // Hooks 调用
  // ==========================================================================

  // 获取 Cases 数据
  const { data: displayData, isLoading, error } = useCasesData();

  // 调试日志（方案 A：直接在组件里，生产环境自动禁用）
  debugLog('Cases data:', displayData);
  debugLog('Cases error:', error);
  debugLog('Cases isLoading:', isLoading);

  // ==========================================================================
  // 早期返回
  // ==========================================================================

  // 加载状态
  if (isLoading) {
    return (
      <section
        id={id}
        data-name={name}
        className='relative snap-section min-h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50 to-white'
      >
        <div className='relative h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-center h-full'>
            <p className='text-gray-400'>加载中...</p>
          </div>
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

  const { title, subtitle, tagline, items, ui } = displayData;
  const viewDetailsLabel = ui.viewDetails;

  return (
    <section
      id={id}
      data-name={name}
      className='relative snap-section min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white'
    >
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen'>
        {/* 1. 标题区 - 靠上对齐 */}
        <div className='text-center pt-28'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-800 mb-4'>{title}</h2>
          <p className='text-lg text-gray-600 max-w-4xl mx-auto'>{subtitle}</p>
        </div>

        {/* 2. 内容区 - 上下居中 */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-full'>
            {/* 案例卡片网格 */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-8'>
              {items.map((item) => (
                <CaseCard key={item.id} item={item} viewDetailsLabel={viewDetailsLabel} />
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
}
