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
import { useTheme, Icon } from '@vxture/design-system';

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

  // mount 前渲染占位，保持与 SSR 输出一致，避免 hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`flex items-center justify-center transition-all duration-300 hover:opacity-80 ${sizeClasses[size]} ${className}`}
        title='切换到暗色模式'
        aria-label='切换到暗色模式'
        disabled
      >
        <Icon name='moon' className={`${iconSizes[size]} text-gray-700`} />
      </button>
    );
  }

  const isDarkMode = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

  return (
    <button
      className={`flex items-center justify-center transition-all duration-300 hover:opacity-80 ${sizeClasses[size]} ${className}`}
      title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
      aria-label={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
      onClick={toggleTheme}
    >
      <span className='sr-only'>
        {isDarkMode ? '亮色模式' : '暗色模式'}
      </span>

      {isDarkMode ? (
        <>
          <Icon name='sun' className={`${iconSizes[size]} text-yellow-400`} />
          {showLabel && <span className='ml-2 text-sm font-medium'>亮色</span>}
        </>
      ) : (
        <>
          <Icon name='moon' className={`${iconSizes[size]} text-gray-700`} />
          {showLabel && <span className='ml-2 text-sm font-medium'>暗色</span>}
        </>
      )}
    </button>
  );
}
