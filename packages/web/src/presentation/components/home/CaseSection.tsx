/**
 * CaseSection.tsx - 首页最佳实践区块（重构版）
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示首页 Cases 区块 UI
 * - 使用 Application Layer 的 useCases Hook 获取数据
 * - 支持吸附滚动、响应式布局、案例卡片展示
 *
 * @layer Presentation
 * @category Components - Home
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LuCalendarDays } from 'react-icons/lu';
import { memo, useMemo } from 'react';
import { useCases } from '@/application/hooks/homepage';
import { useLocale } from '@/application/hooks/shared/useLocale';

// 单个案例卡片组件（性能优化：React.memo）
interface CaseCardProps {
  item: {
    id: string;
    slug: string;
    title: string;
    description: string;
    tags: string[];
    cover: {
      url: string;
      alt: string;
    };
    publishedAt: string;
    cta?: {
      label: string;
      href: string;
    };
  };
  uiTexts: {
    viewDetails: string;
  };
}

const CaseCard = memo(function CaseCard({ item, uiTexts }: CaseCardProps) {
  // 格式化日期为 YYYY/MM
  const date = new Date(item.publishedAt);
  const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  return (
    <div
      className={`group relative bg-white hover:bg-blue-50 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden hover:border-blue-400`}
    >
      {/* 图片区域，16:9 比例 */}
      <div className='relative w-full aspect-[16/9]'>
        <Image
          src={item.cover.url}
          alt={item.cover.alt}
          fill
          className='object-cover rounded-t-2xl'
          sizes='(max-width: 768px) 100vw, 400px'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-t from-blue-200/80 via-blue-100/80 to-transparent group-hover:opacity-40 rounded-t-2xl pointer-events-none'></div>
      </div>
      {/* 内容区 */}
      <div className='p-6 space-y-4'>
        <h3 className='text-2xl font-bold text-blue-800 text-left'>{item.title}</h3>
        <p className='text-gray-600 leading-relaxed text-left'>{item.description}</p>
        <div className='flex flex-wrap gap-2 justify-start'>
          {item.tags.map((tag) => (
            <span
              key={tag}
              className='px-3 py-1 bg-blue-50 text-blue-500 text-sm font-semibold rounded-full border border-blue-50'
            >
              {tag}
            </span>
          ))}
        </div>
        <div className='pt-4 flex items-center justify-between'>
          <div className='flex items-center text-gray-500 text-xs font-semibold'>
            <LuCalendarDays className='mr-1 w-5 h-5' />
            {formattedDate}
          </div>
          <div className='flex-1 flex justify-end'>
            <Link
              href={item.cta?.href || `/cases/${item.slug}`}
              className='inline-flex items-center text-sm font-semibold text-gray-500 rounded-lg transition-all duration-300 ml-auto bg-transparent border-none shadow-none hover:text-blue-600'
            >
              {item.cta?.label || uiTexts.viewDetails}
              <svg className='ml-2 w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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

// 首页最佳实践区块
interface CaseSectionProps {
  id: string;
}

export default function CaseSection({ id }: CaseSectionProps) {
  // 获取当前语言
  const { locale } = useLocale();

  // 获取 Cases 数据
  const { data: casesData, isLoading } = useCases();

  // 根据语言设置默认 UI 文本
  const defaultUiTexts = useMemo(() => {
    if (locale === 'en-US') {
      return {
        viewDetails: 'View Details',
        moreText: 'More Cases',
      };
    }
    return {
      viewDetails: '查看详情',
      moreText: '更多案例',
    };
  }, [locale]);

  // 如果数据未加载，显示加载状态
  if (isLoading || !casesData) {
    return (
      <section
        id={id}
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

  const cases = casesData.items;
  const uiTexts = casesData.ui || defaultUiTexts;

  return (
    <section
      id='snap-section-4'
      className='relative snap-section min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white'
    >
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen'>
        {/* 1. 标题区 - 靠上对齐 */}
        <div className='text-center pt-28'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-800 mb-4'>{casesData.title}</h2>
          <p className='text-lg text-gray-600 max-w-4xl mx-auto'>{casesData.subtitle}</p>
        </div>

        {/* 2. 内容区 - 上下居中 */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-full py-8'>
            {/* 案例卡片网格 */}
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {cases.map((item) => (
                <CaseCard key={item.id} item={item} uiTexts={uiTexts} />
              ))}
            </div>
          </div>
        </div>

        {/* 3. 底部区 - 靠下对齐 */}
        {casesData.tagline && (
          <div className='text-center pb-20'>
            <div className='inline-flex items-center space-x-2'>
              <div className='w-8 h-[1px] bg-gradient-to-r from-transparent to-blue-200'></div>
              <span className='text-sm font-medium text-blue-500'>{casesData.tagline}</span>
              <div className='w-8 h-[1px] bg-gradient-to-l from-transparent to-blue-200'></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
