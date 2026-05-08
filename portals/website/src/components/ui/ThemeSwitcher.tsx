/**
 * ThemeSwitcher.tsx
 *
 * 功能：
 * - 主题切换按钮组件，支持亮色/暗色模式
 * - 内置动画效果，自动记忆用户主题偏好（由 next-themes 通过 localStorage 自动处理）
 *
 * 用途：
 * - 全局主题切换入口
 * - 可独立使用或嵌入导航栏
 *
 * 依赖/调用关系：
 * - 使用 useTheme from @vxture/design-system 获取和设置主题状态
 *
 * @file ThemeSwitcher.tsx
 * @desc 主题切换组件，支持亮色/暗色模式
 * @author AI-Generated
 * @created 2026-03-15
 * @date 2026-03-18
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 2.0.0
 * @dependencies React, useTheme, Icon
 * @category Components - UI
 * @layer Presentation
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme, Icon } from '@vxture/design-system';
import { WEBSITE_THEME_OPTIONS } from '@/data/theme/theme.data';
import type { Theme } from '@vxture/shared';
import { setGlobalThemePreference } from '@vxture/platform-browser';

// ============================================================================
// 组件实现区
// ============================================================================

export default function ThemeSwitcher({
  className = '',
  size = 'medium',
  showLabel = false,
}: {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('layout.header.theme');

  // ——— SSR / Hydration 安全 ———
  // next-themes 在服务端 theme 为 undefined，直接用 isDarkMode 会导致
  // SSR 与 Client 渲染结果不一致 → Hydration mismatch。
  // 解决方案：mounted 前始终渲染"亮色"占位，mount 后再读取真实主题。
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  const activeTheme = (theme ?? 'system') as Theme;
  const activeOptionIndex = Math.max(
    WEBSITE_THEME_OPTIONS.findIndex((option) => option.value === activeTheme),
    0,
  );
  const activeOption = WEBSITE_THEME_OPTIONS[activeOptionIndex]!;
  const nextOption = WEBSITE_THEME_OPTIONS[(activeOptionIndex + 1) % WEBSITE_THEME_OPTIONS.length]!;

  // mount 前渲染占位，保持与 SSR 输出一致，避免 hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`flex items-center justify-center transition-all duration-300 hover:opacity-80 ${sizeClasses[size]} ${className}`}
        title={t('switchTo', { theme: t('dark') })}
        aria-label={t('switchTo', { theme: t('dark') })}
        disabled
      >
        <Icon name='moon' className={`${iconSizes[size]} text-vx-gray-700`} />
      </button>
    );
  }

  return (
    <button
      className={`flex items-center justify-center transition-all duration-300 hover:opacity-80 ${sizeClasses[size]} ${className}`}
      title={t('switchTo', { theme: t(nextOption.labelKey) })}
      aria-label={t('switchTo', { theme: t(nextOption.labelKey) })}
      onClick={() => {
        setTheme(nextOption.value);
        setGlobalThemePreference(nextOption.value);
      }}
    >
      <span className='sr-only'>
        {t(activeOption.labelKey)}
      </span>

      <Icon
        name={activeOption.icon}
        className={`${iconSizes[size]} ${
          activeOption.value === 'dark'
            ? 'text-vx-warning-400'
            : activeOption.value === 'light'
            ? 'text-vx-gray-700'
            : 'text-vx-info-500'
        }`}
      />
      {showLabel && <span className='ml-2 text-sm font-medium'>{t(activeOption.labelKey)}</span>}
    </button>
  );
}
