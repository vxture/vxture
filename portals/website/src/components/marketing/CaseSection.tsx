/**
 * CaseSection.tsx - 首页最佳实践区块（重构版）
 *
 * 功能：展示首页 Cases 区块 UI，使用 data + messages 分离架构
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

import Image from 'next/image';
import { Link } from '@/lib/i18n/navigation';
import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { debugLog } from '@vxture/shared';
import { HOME_CASES_DATA } from '@/data/home/home.cases.data';
import { CASES_DATA } from '@/data/cases/cases.data';

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
    readonly coverUrl: string;
    readonly publishedAt: string;
    readonly href: string;
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

  // 从 CASES_DATA 中获取完整案例信息
  const fullCase = CASES_DATA.items.find((c) => c.id === item.id);
  const title = fullCase?.title || '案例';
  const description = fullCase?.description || '';
  const tags = fullCase?.tags || [];

  // ==========================================================================
  // 渲染
  // ==========================================================================

  return (
    <div
      className={`group relative flex flex-col rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 h-full`}
    >
      {/* 图片区域，16:9 比例 */}
      <div className='relative w-full aspect-video shrink-0'>
        <Image
          src={item.coverUrl}
          alt={title}
          fill
          className='object-cover rounded-t-2xl'
          sizes='(max-width: 768px) 100vw, 400px'
          priority
        />
      </div>
      {/* 内容区 */}
      <div className='p-4 flex flex-col grow'>
        {/* 标题 */}
        <h3 className='text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors'>
          {title}
        </h3>
        {/* 描述 */}
        <p className='text-gray-600 mb-4 line-clamp-3'>
          {description}
        </p>
        {/* 标签 */}
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* 底部信息 */}
        <div className='mt-auto flex items-center justify-between text-sm text-gray-500'>
          <span>{formattedDate}</span>
          <Link href={item.href} className='text-blue-600 hover:text-blue-700 font-medium'>
            {viewDetailsLabel}
          </Link>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// 主组件实现
// ============================================================================

/**
 * 案例区块主组件
 */
export default function CaseSection({ id, name = 'Cases' }: CaseSectionProps) {
  const t = useTranslations('home.cases');

  // 调试日志（方案 A：直接在组件里，生产环境自动禁用）
  debugLog('Home cases data:', HOME_CASES_DATA);

  // ==========================================================================
  // 早期返回
  // ==========================================================================

  // 如果内容被禁用，不渲染
  if (!HOME_CASES_DATA.enabled) {
    return null;
  }

  // ==========================================================================
  // 渲染
  // ==========================================================================

  return (
    <section
      id={id}
      data-name={name}
      className='relative snap-section min-h-screen flex flex-col bg-linear-to-b from-gray-50 to-white'
    >
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen'>
        {/* 1. 标题区 - 靠上对齐 */}
        <div className='text-center pt-28'>
          <h2 className='text-3xl lg:text-4xl font-bold text-gray-800 mb-4'>
            {t(HOME_CASES_DATA.titleKey)}
          </h2>
          <p className='text-lg text-gray-600 max-w-4xl mx-auto mb-8'>
            {t(HOME_CASES_DATA.subtitleKey)}
          </p>
        </div>

        {/* 2. 内容区 - 上下居中 */}
        <div className='flex flex-1 items-center justify-center py-8'>
          <div className='w-full'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {HOME_CASES_DATA.items.map((item) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  viewDetailsLabel={t(HOME_CASES_DATA.ui.viewDetailsKey)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. 底部区 - 靠下对齐 */}
        {HOME_CASES_DATA.taglineKey && (
          <div className='text-center pb-12'>
            <div className='inline-flex items-center space-x-2'>
              <div className='w-8 h-0.5 bg-linear-to-r from-transparent to-blue-200'></div>
              <span className='text-sm font-medium text-blue-500'>
                {t(HOME_CASES_DATA.taglineKey)}
              </span>
              <div className='w-8 h-0.5 bg-linear-to-l from-transparent to-blue-200'></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
