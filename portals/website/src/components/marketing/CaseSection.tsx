/**
 * CaseSection.tsx - 首页最佳实践区块
 *
 * 功能：展示首页 Cases 区块 UI，使用 data + messages 分离架构
 * 文本数据：来自 home.cases 命名空间（messages/{locale}/home/cases.json）
 * 结构数据：来自 HOME_CASES_DATA（仅含 id/slug/coverUrl/href/publishedAt）
 *
 * @package @vxture/website
 * @layer Presentation
 * @category Components - Home
 * @author AI-Generated
 * @date 2026-03-19
 */
'use client';

import Image from 'next/image';
import { Link } from '@/lib/i18n/navigation';
import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { debugLog } from '@vxture/shared';
import { HOME_CASES_DATA } from '@/data/home/home.cases.data';

// ============================================================================
// 类型定义
// ============================================================================

interface CaseCardProps {
  readonly item: {
    readonly id: string;
    readonly coverUrl: string;
    readonly publishedAt: string;
    readonly href: string;
  };
  readonly viewDetailsLabel: string;
}

interface CaseSectionProps {
  readonly id: string;
  readonly name?: string;
}

// ============================================================================
// 子组件
// ============================================================================

/**
 * 单个案例卡片
 *
 * 统一色值规范：
 *   light: 白底卡片，深灰标题，灰色描述，灰色标签
 *   dark:  slate-700 卡片，浅色标题，slate-300 描述，slate-600 标签
 */
const CaseCard = memo(function CaseCard({ item, viewDetailsLabel }: CaseCardProps) {
  const formattedDate = useMemo(() => {
    const date = new Date(item.publishedAt);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [item.publishedAt]);

  const t = useTranslations(`home.cases.items.${item.id}`);
  const title       = t('title');
  const description = t('description');
  const tRaw = useTranslations('home.cases.items');
  const tags  = (tRaw.raw(`${item.id}.tags`) as string[]) ?? [];

  return (
    <div className='group relative flex flex-col rounded-2xl shadow-lg dark:shadow-slate-900/30 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 h-full'>
      {/* 图片区域 16:9 */}
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
      <div className='p-4 flex flex-col grow bg-white dark:bg-slate-700'>
        <h3 className='text-xl font-semibold mb-2 text-blue-700 dark:text-blue-200 group-hover:text-blue-500 dark:group-hover:text-blue-100 transition-colors'>
          {title}
        </h3>
        <p className='text-gray-600 dark:text-slate-300 mb-4 line-clamp-3'>{description}</p>
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className='px-2 py-1 bg-blue-50 dark:bg-blue-800/40 text-blue-600 dark:text-blue-200 border border-blue-100 dark:border-blue-700/50 text-xs rounded-full'
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className='mt-auto flex items-center justify-between text-sm text-gray-400 dark:text-slate-400'>
          <span>{formattedDate}</span>
          <Link
            href={item.href}
            className='text-blue-600 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-100 font-medium'
          >
            {viewDetailsLabel}
          </Link>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// 主组件
// ============================================================================

/**
 * 案例区块主组件
 *
 * 背景渐变：section 4（Cases）
 *   light: from-white to-blue-50   （上接 Solution 白底，向下过渡到浅蓝）
 *   dark:  from-slate-800 to-slate-700
 */
export default function CaseSection({ id, name = 'Cases' }: CaseSectionProps) {
  const t = useTranslations('home.cases');

  debugLog('Home cases data:', HOME_CASES_DATA);

  if (!HOME_CASES_DATA.enabled) return null;

  return (
    <section
      id={id}
      data-name={name}
      className='relative snap-section min-h-screen flex flex-col bg-linear-to-br from-blue-100 to-white dark:from-slate-800 dark:to-slate-700'
    >
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen'>
        {/* 标题区 */}
        <div className='text-center pt-28'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-700 dark:text-blue-200 mb-4'>
            {t(HOME_CASES_DATA.titleKey)}
          </h2>
          <p className='text-lg text-gray-600 dark:text-slate-300 max-w-4xl mx-auto mb-8'>
            {t(HOME_CASES_DATA.subtitleKey)}
          </p>
        </div>

        {/* 卡片区 */}
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

        {/* 底部 tagline */}
        {HOME_CASES_DATA.taglineKey && (
          <div className='text-center pb-12'>
            <div className='inline-flex items-center space-x-2'>
              <div className='w-8 h-0.5 bg-linear-to-r from-transparent to-blue-200 dark:to-blue-600'></div>
              <span className='text-sm font-medium text-blue-500 dark:text-blue-300'>
                {t(HOME_CASES_DATA.taglineKey)}
              </span>
              <div className='w-8 h-0.5 bg-linear-to-l from-transparent to-blue-200 dark:to-blue-600'></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
