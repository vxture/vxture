/**
 * CTASection.tsx - 首页行动号召区块（重构版）
 *
 * 功能：展示首页 CTA 区块 UI，使用 data + messages 分离架构
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

import { Link } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { debugLog } from '@vxture/shared';
import { Icon } from '@vxture/design-system';
import { CTA_DATA } from '@/data/home/home.cta.data';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * CTA 区块 Props
 */
interface CTASectionProps {
  readonly id: string;
  readonly name?: string;
}

// ============================================================================
// 主组件实现
// ============================================================================

/**
 * 首页行动号召区块
 */
export default function CTASection({ id, name = 'CTA' }: CTASectionProps) {
  // ==========================================================================
  // Hooks 调用
  // ==========================================================================

  const t = useTranslations('home.cta');

  // 调试日志（方案 A：直接在组件里，生产环境自动禁用）
  debugLog('CTA data:', CTA_DATA);

  // ==========================================================================
  // 早期返回
  // ==========================================================================

  // 如果内容被禁用，不渲染
  if (!CTA_DATA.enabled) {
    return null;
  }

  // ==========================================================================
  // 渲染
  // ==========================================================================

  return (
    <section
      id={id}
      data-name={name}
      className='relative snap-section min-h-[65vh] flex flex-col justify-center bg-linear-to-b from-blue-50 to-white'
    >
      {/* ===== 主内容区 ===== */}
      <div className='flex flex-col justify-center w-full h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        {/* ===== CTA 标题区 ===== */}
        <div className='w-full text-center'>
          {/* 主标题 */}
          <h2 className='text-4xl lg:text-5xl font-bold pt-20 pb-6'>
            <span className='text-blue-600'>{t(CTA_DATA.titleKey)}</span>
          </h2>
          {/* 副标题 */}
          <p className='text-lg lg:text-xl text-gray-600 py-6 leading-relaxed'>
            {t(CTA_DATA.subtitleKey)}
          </p>
        </div>

        {/* ===== CTA 按钮区 ===== */}
        <div className='w-full flex flex-col sm:flex-row gap-8 justify-center items-center py-6'>
          {CTA_DATA.actions.map((action, index) => {
            const isExternal = action.href.startsWith('http');
            const buttonClass = `group px-8 py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 min-w-[200px] ${
              action.variant === 'primary'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl'
                : 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg'
            }`;
            const buttonContent = (
              <span className='flex items-center justify-center space-x-2'>
                {action.variant === 'secondary' && <Icon name='chat-circle' className='w-5 h-5' />}
                <span>{t(`actions.${index}.label`)}</span>
                {action.variant === 'primary' && (
                  <Icon name='arrow-right' className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' />
                )}
              </span>
            );

            if (isExternal) {
              return (
                <a
                  key={action.href}
                  href={action.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={buttonClass}
                >
                  {buttonContent}
                </a>
              );
            }
            return (
              <Link key={action.href} href={action.href} className={buttonClass}>
                {buttonContent}
              </Link>
            );
          })}
        </div>

        {/* ===== 联系方式区 ===== */}
        {CTA_DATA.contact && (
          <div className='w-full py-6 rounded-2xl border border-gray-200'>
            <p className='text-center text-gray-600 mb-4'>{t('contact.description')}</p>
            <div className='flex flex-col sm:flex-row gap-6 justify-center items-center text-sm'>
              {CTA_DATA.contact.email && (
                <div className='flex items-center space-x-2 text-gray-700'>
                  <Icon name='mail' className='w-4 h-4 text-blue-500' />
                  <span>{CTA_DATA.contact.email.value}</span>
                </div>
              )}
              {CTA_DATA.contact.phone && (
                <div className='flex items-center space-x-2 text-gray-700'>
                  <Icon name='phone' className='w-4 h-4 text-green-500' />
                  <span>{CTA_DATA.contact.phone.value}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
