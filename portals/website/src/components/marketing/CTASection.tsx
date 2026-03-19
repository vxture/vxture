/**
 * CTASection.tsx - 首页行动号召区块（重构版）
 *
 * 功能：展示首页 CTA 区块 UI，使用 data + messages 分离架构
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

import { Link } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { debugLog } from '@vxture/shared';
import { Icon } from '@vxture/design-system';
import { CTA_DATA } from '@/data/home/home.cta.data';

// ============================================================================
// 类型定义
// ============================================================================

interface CTASectionProps {
  readonly id: string;
  readonly name?: string;
}

// ============================================================================
// 主组件实现
// ============================================================================

/**
 * 首页行动号召区块
 *
 * 背景渐变：section 5（CTA）
 *   light: from-blue-50 to-white   （上接 Cases 浅蓝，向下收尾至白）
 *   dark:  from-slate-700 to-slate-800
 */
export default function CTASection({ id, name = 'CTA' }: CTASectionProps) {
  const t = useTranslations('home.cta');

  debugLog('CTA data:', CTA_DATA);

  if (!CTA_DATA.enabled) {
    return null;
  }

  return (
    <section
      id={id}
      data-name={name}
      className='relative snap-section min-h-[65vh] flex flex-col justify-center bg-linear-to-br from-blue-100 to-white dark:from-slate-800 dark:to-slate-700'
    >
      {/* ===== 主内容区 ===== */}
      <div className='flex flex-col justify-center w-full h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        {/* ===== CTA 标题区 ===== */}
        <div className='w-full text-center'>
          {/* 主标题 */}
          <h2 className='text-4xl lg:text-5xl font-bold pt-20 pb-6 text-blue-700 dark:text-blue-200'>
            {t(CTA_DATA.titleKey)}
          </h2>
          {/* 副标题 */}
          <p className='text-lg lg:text-xl text-gray-600 dark:text-slate-300 py-6 leading-relaxed'>
            {t(CTA_DATA.subtitleKey)}
          </p>
        </div>

        {/* ===== CTA 按钮区 ===== */}
        <div className='w-full flex flex-col sm:flex-row gap-8 justify-center items-center py-6'>
          {CTA_DATA.actions.map((action, index) => {
            const isExternal = action.href.startsWith('http');
            const buttonClass = `group px-8 py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 min-w-[200px] ${
              action.variant === 'primary'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 hover:shadow-2xl'
                : 'border-2 border-blue-200 dark:border-slate-500 text-blue-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-200 hover:shadow-lg'
            }`;
            const buttonContent = (
              <span className='flex items-center justify-center space-x-2'>
                {action.variant === 'secondary' && <Icon name='chat-circle' className='w-5 h-5' />}
                <span>{t(`actions.${index}.label`)}</span>
                {action.variant === 'primary' && (
                  <Icon
                    name='arrow-right'
                    className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300'
                  />
                )}
              </span>
            );

            if (isExternal) {
              return (
                <a key={action.href} href={action.href} target='_blank' rel='noopener noreferrer' className={buttonClass}>
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
          <div className='w-full py-6 rounded-2xl border border-blue-100 dark:border-slate-600'>
            <p className='text-center text-gray-600 dark:text-slate-300 mb-4'>{t('contact.description')}</p>
            <div className='flex flex-col sm:flex-row gap-6 justify-center items-center text-sm'>
              {CTA_DATA.contact.email && (
                <div className='flex items-center space-x-2 text-gray-700 dark:text-slate-200'>
                  <Icon name='mail' className='w-4 h-4 text-blue-500 dark:text-blue-300' />
                  <span>{CTA_DATA.contact.email.value}</span>
                </div>
              )}
              {CTA_DATA.contact.phone && (
                <div className='flex items-center space-x-2 text-gray-700 dark:text-slate-200'>
                  <Icon name='phone' className='w-4 h-4 text-blue-500 dark:text-blue-300' />
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
