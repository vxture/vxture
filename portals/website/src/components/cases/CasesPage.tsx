/**
 * CasesPage.tsx - 案例库页面
 *
 * 功能：展示完整案例库，支持筛选和搜索
 *
 * @author AI-Generated
 * @date 2026-03-17
 * @package @vxture/website
 * @layer Presentation
 * @category Components - Cases
 */
'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/lib/i18n/navigation';
import { debugLog } from '@vxture/shared';
import { CASES_DATA } from '@/data/cases/cases.data';

/**
 * 案例库页面组件
 */
export default function CasesPage() {
  const t = useTranslations('cases');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  debugLog('Cases data:', CASES_DATA);

  // 筛选案例
  const filteredCases = useMemo(() => {
    return CASES_DATA.items.filter((item) => {
      const matchesCategory = selectedCategory === 'all' ||
        item.tags.some(tag =>
          CASES_DATA.categories.find(cat => cat.slug === selectedCategory)?.nameKey === tag
        );

      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  if (!CASES_DATA.enabled) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>{t(CASES_DATA.titleKey)}</h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            {t(CASES_DATA.subtitleKey)}
          </p>
        </div>

        {/* 筛选与搜索 */}
        <div className='flex flex-col md:flex-row gap-6 mb-12'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder={t(CASES_DATA.ui.searchKey)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('filters.all')}
            </button>

            {CASES_DATA.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t(category.nameKey)}
              </button>
            ))}
          </div>
        </div>

        {/* 案例列表 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {filteredCases.map((item) => (
            <div
              key={item.id}
              className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300'
            >
              <div className='relative aspect-video'>
                <Image
                  src={item.cover.url}
                  alt={item.title}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
              </div>

              <div className='p-6'>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>{item.title}</h3>
                <p className='text-gray-600 mb-4 line-clamp-3'>{item.description}</p>

                <div className='flex flex-wrap gap-2 mb-4'>
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-500'>{item.publishedAt}</span>
                  <Link
                    href={item.cta.href}
                    className='text-blue-600 hover:text-blue-800 font-medium text-sm'
                  >
                    {t(CASES_DATA.ui.viewDetailsKey)}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 无结果提示 */}
        {filteredCases.length === 0 && (
          <div className='text-center py-16'>
            <p className='text-gray-500 text-lg'>
              {t('noResults')}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              {t('clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
