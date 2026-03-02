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

import Link from 'next/link';
import type { Route } from 'next';
import { useCTA } from '@/application/hooks/homepage';
import { FiMail, FiPhone, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import BackToTopButton from '@/presentation/components/common/BackToTopButton';

interface CTASectionProps {
  id: string;
  snapToTarget?: (target: HTMLElement) => void;
}

export default function CTASection({ id, snapToTarget }: CTASectionProps) {
  // 获取 CTA 数据
  const { data: ctaData, isLoading } = useCTA();

  // 如果数据未加载，显示加载状态
  if (isLoading || !ctaData) {
    return (
      <section
        id={id}
        className='relative snap-section min-h-[65vh] flex flex-col justify-center bg-gradient-to-b from-blue-50 to-blue-50'
      >
        <div className='relative max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center'>
          <p className='text-gray-400'>加载中...</p>
        </div>
      </section>
    );
  }
  return (
    <section
      id='snap-section-5'
      className='relative snap-section min-h-[65vh] flex flex-col justify-center bg-gradient-to-b from-blue-50 to-white'
    >
      {/* ===== 主内容区 ===== */}
      <div className='flex flex-col justify-center w-full h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        {/* ===== CTA 标题区 ===== */}
        <div className='w-full text-center'>
          {/* 主标题 */}
          <h2 className='text-4xl lg:text-5xl font-bold pt-20 pb-6'>
          <span className='text-blue-600'>{ctaData.title}</span>
          </h2>
          {/* 副标题 */}
          {ctaData.subtitle && (
            <p className='text-lg lg:text-xl text-gray-600 py-6 leading-relaxed'>
              {ctaData.subtitle}
            </p>
          )}
        </div>

        {/* ===== CTA 按钮区 ===== */}
        <div className='w-full flex flex-col sm:flex-row gap-8 justify-center items-center py-6'>
          {ctaData.actions.map((action) => {
            const isExternal = action.href.startsWith('http');
            const buttonClass = `group px-8 py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 min-w-[200px] ${
              action.variant === 'primary'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl'
                : 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg'
            }`;
            const buttonContent = (
              <span className='flex items-center justify-center space-x-2'>
                {action.variant === 'secondary' && (
                  <FiMessageCircle className='w-5 h-5' />
                )}
                <span>{action.label}</span>
                {action.variant === 'primary' && (
                  <FiArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' />
                )}
              </span>
            );

            if (isExternal) {
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass}
                >
                  {buttonContent}
                </a>
              );
            }
            return (
              <Link
                key={action.label}
                href={action.href as Route}
                className={buttonClass}
              >
                {buttonContent}
              </Link>
            );
          })}
        </div>

        {/* ===== 联系方式区 ===== */}
        <div className='w-full py-6 rounded-2xl border border-gray-200'>
          <p className='text-center text-gray-600 mb-4'>{ctaData.contact.description}</p>
          <div className='flex flex-col sm:flex-row gap-6 justify-center items-center text-sm'>
            <div className='flex items-center space-x-2 text-gray-700'>
              <FiMail className='w-4 h-4 text-blue-500' />
              <span>{ctaData.contact.email.value}</span>
            </div>
            <div className='flex items-center space-x-2 text-gray-700'>
              <FiPhone className='w-4 h-4 text-green-500' />
              <span>{ctaData.contact.phone.value}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 回到顶部按钮 */}
      <BackToTopButton
        text={ctaData.backToTop}
        ariaLabel={ctaData.backToTop}
        snapToTarget={snapToTarget}
      />
    </section>
  );
}
