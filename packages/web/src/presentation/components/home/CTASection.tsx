/**
 * CTASection.tsx - 首页行动号召区块（重构版）
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示首页 CTA 区块 UI
 * - 使用 Application Layer 的 useCTA Hook 获取数据
 * - 支持装饰背景、响应式布局、行动按钮
 *
 * @layer Presentation
 * @category Components - Home
 */
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCTA } from '@/application/hooks/homepage';
import { useLocale } from '@/application/hooks/shared/useLocale';

interface CTASectionProps {
  id: string;
}

export default function CTASection({ id }: CTASectionProps) {
  // 获取当前语言
  const { locale } = useLocale();

  // 获取 CTA 数据
  const { data: ctaData, isLoading } = useCTA();

  // 根据语言设置默认回到顶部文本
  const backToTopText = useMemo(() => {
    return locale === 'en-US' ? 'Back to Top' : '回到顶部';
  }, [locale]);

  // 如果数据未加载，显示加载状态
  if (isLoading || !ctaData) {
    return (
      <section
        id={id}
        className='relative snap-section pt-40 pb-12 bg-gradient-to-b from-blue-50 to-blue-50'
      >
        <div className='relative max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <p className='text-gray-400'>加载中...</p>
        </div>
      </section>
    );
  }
  return (
    <section
      id='snap-section-5'
      className='relative snap-section pt-40 pb-12 bg-gradient-to-b from-blue-50 to-white'
    >
      {/* ===== 简化的背景装饰层 ===== */}
      <div className='absolute inset-0 pointer-events-none select-none'>
        <div className='absolute top-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl' />
        <div className='absolute bottom-20 right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl' />
      </div>

      {/* ===== 主内容区 ===== */}
      <div className='relative max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        {/* 主标题 */}
        <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
          <span className='inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent'>
            {ctaData.title}
          </span>
        </h2>

        {/* 副标题 */}
        {ctaData.subtitle && (
          <p className='text-lg lg:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed'>
            {ctaData.subtitle}
          </p>
        )}

        {/* ===== CTA 按钮区 ===== */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
          {ctaData.actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`group px-8 py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 min-w-[200px] ${
                action.variant === 'primary'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl'
                  : 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg'
              }`}
            >
              <span className='flex items-center justify-center space-x-2'>
                {action.variant === 'secondary' && (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    />
                  </svg>
                )}
                <span>{action.label}</span>
                {action.variant === 'primary' && (
                  <svg
                    className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300'
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
                )}
              </span>
            </Link>
          ))}
        </div>

        {/* ===== 联系方式区 ===== */}
        <div className='py-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100'>
          <p className='text-gray-600 mb-4'>{ctaData.contact.description}</p>
          <div className='flex flex-col sm:flex-row gap-6 justify-center items-center text-sm'>
            <div className='flex items-center space-x-2 text-gray-700'>
              <svg
                className='w-4 h-4 text-blue-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
              <span>{ctaData.contact.email.value}</span>
            </div>
            <div className='flex items-center space-x-2 text-gray-700'>
              <svg
                className='w-4 h-4 text-green-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                />
              </svg>
              <span>{ctaData.contact.phone.value}</span>
            </div>
          </div>
        </div>
      </div>
      {/* 回到顶部按钮 */}
      <div className='absolute right-16 bottom-20 z-20'>
        <button
          type='button'
          className='flex flex-col items-center px-3 py-2 rounded-full bg-white/0 hover:bg-gray-100 transition animate-bounce'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={backToTopText}
        >
          <svg
            className='w-6 h-6 text-gray-400 mb-1'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 10l7-7m0 0l7 7m-7-7v18'
            />
          </svg>
          <span className='text-xs text-gray-400'>{backToTopText}</span>
        </button>
      </div>
    </section>
  );
}
