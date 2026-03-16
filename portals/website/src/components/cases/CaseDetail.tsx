/**
 * CaseDetail.tsx - 案例详情页面
 *
 * 功能：展示单个案例的详细信息
 *
 * @author AI-Generated
 * @date 2026-03-17
 * @package @vxture/website
 * @layer Presentation
 * @category Components - Cases
 */
'use client';

import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { CASES_DATA } from '@/data/cases/cases.data';

/**
 * 案例详情页面组件 Props
 */
interface CaseDetailProps {
  slug: string;
}

/**
 * 案例详情页面组件
 */
export default function CaseDetail({ slug }: CaseDetailProps) {
  const t = useTranslations('cases');

  const caseItem = CASES_DATA.items.find((item) => item.slug === slug);

  if (!caseItem) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-16'>
        {/* 案例头部 */}
        <div className='mb-12'>
          <div className='flex flex-wrap gap-2 mb-4'>
            {caseItem.tags.map((tag, index) => (
              <span
                key={index}
                className='px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className='text-4xl font-bold text-gray-900 mb-4'>{caseItem.title}</h1>
          <p className='text-xl text-gray-600 mb-6'>{caseItem.subtitle}</p>

          <div className='flex items-center gap-4 text-sm text-gray-500'>
            <span>{caseItem.publishedAt}</span>
          </div>
        </div>

        {/* 案例封面 */}
        <div className='relative aspect-video mb-12 rounded-lg overflow-hidden shadow-lg'>
          <Image
            src={caseItem.cover.url}
            alt={caseItem.title}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px'
            priority
          />
        </div>

        {/* 案例详情内容 */}
        <div className='space-y-12'>
          {/* 案例描述 */}
          <div>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>{t('overview')}</h2>
            <p className='text-gray-600 leading-relaxed'>{caseItem.description}</p>
          </div>

          {/* 功能亮点 */}
          {caseItem.tags.length > 0 && (
            <div>
              <h2 className='text-2xl font-semibold text-gray-900 mb-6'>{t('highlights')}</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {caseItem.tags.map((tag, index) => (
                  <div
                    key={index}
                    className='bg-white rounded-lg shadow-md p-6'
                  >
                    <div className='flex items-start gap-4'>
                      <div className='flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium'>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                          {tag}
                        </h3>
                        <p className='text-gray-600'>{t(`highlights.${index}`)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
