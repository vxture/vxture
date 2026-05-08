/**
 * LocaleSwitcher.tsx
 *
 * 功能：
 * - 语言切换组件，支持多语言选择
 * - 内置下拉菜单、动画效果、主题适配
 *
 * 用途：
 * - 全局语言切换入口
 * - 可独立使用或嵌入导航栏
 *
 * 依赖/调用关系：
 * - 使用 useLocale 获取和设置语言状态
 * - 使用 useTheme from @vxture/design-system 获取主题状态
 *
 * @file LocaleSwitcher.tsx
 * @desc 语言切换组件，支持多语言选择
 * @author AI-Generated
 * @created 2026-03-16
 * @date 2026-03-18
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 2.0.0
 * @dependencies React, useLocale, useTheme, Icon
 * @category Components - UI
 * @layer Presentation
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale as useNextIntlLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useTheme, Icon } from '@vxture/design-system';
import type { Locale } from '@vxture/shared';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_CONFIGS } from '@vxture/shared';
import { setGlobalLocalePreference } from '@vxture/platform-browser';

// ============================================================================
// 类型定义区
// ============================================================================

interface LocaleOption {
  code: Locale;
  label: string;
}

// ============================================================================
// 组件实现区
// ============================================================================

export default function LocaleSwitcher({
  className = '',
  size = 'medium',
  showLabel = false,
}: {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('layout.header');
  const currentLocale = useNextIntlLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  // 语言验证和获取
  const locale = SUPPORTED_LOCALES.includes(currentLocale) ? currentLocale : DEFAULT_LOCALE;

  // 语言切换函数
  const setLocale = (newLocale: Locale) => {
    setGlobalLocalePreference(newLocale);
    router.push(pathname, { locale: newLocale });
  };

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // 尺寸配置
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  // 语言选项
  const localeOptions: LocaleOption[] = SUPPORTED_LOCALES.map((loc) => ({
    code: loc,
    label: LOCALE_CONFIGS[loc].nativeName,
  }));

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // 处理语言切换
  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsMenuOpen(false);
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        className={`flex items-center justify-center transition-all duration-300 hover:opacity-80 ${sizeClasses[size]}`}
        title={t('language.title')}
        aria-label={t('language.title')}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className='sr-only'>{t('language.title')}</span>

        <Icon
          name="globe"
          className={`${iconSizes[size]} ${
            isDarkMode ? 'text-vx-info-400' : 'text-vx-gray-700'
          }`}
        />

        {showLabel && (
          <span className='ml-2 text-sm font-medium'>
            {localeOptions.find(l => l.code === locale)?.label || locale}
          </span>
        )}
      </button>

      {/* 语言下拉菜单 */}
      {isMenuOpen && (
        <div className={`absolute right-0 mt-2 w-32 border rounded-lg shadow-lg z-10 ${
          isDarkMode ? 'bg-vx-gray-800 border-vx-gray-700' : 'bg-vx-surface border-vx-border'
        }`}>
          {localeOptions.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => handleLocaleChange(lang.code)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                locale === lang.code
                  ? 'bg-vx-cyan-50 text-vx-cyan-600 font-medium'
                  : isDarkMode
                  ? 'text-vx-gray-200 hover:bg-vx-gray-700'
                  : 'text-vx-gray-700 hover:bg-vx-gray-50'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === localeOptions.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
