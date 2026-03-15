/**
 * ThemeSwitcher.tsx
 *
 * 功能：
 * - 主题切换按钮组件，支持亮色/暗色模式
 * - 内置动画效果，自动记忆用户主题偏好
 *
 * 用途：
 * - 全局主题切换入口
 * - 可独立使用或嵌入导航栏
 *
 * 依赖/调用关系：
 * - 使用 useThemeStore 获取和设置主题状态
 *
 * @file ThemeSwitcher.tsx
 * @desc 主题切换组件，支持亮色/暗色模式
 * @author AI-Generated
 * @created 2026-03-15
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, useThemeStore, Icon
 * @category Components - UI
 * @layer Presentation
 */

'use client';

import { useThemeStore } from '@/stores/theme.store';
import { Icon } from '@vxture/design-system';

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
  const { isDarkMode, toggleTheme } = useThemeStore();

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

  return (
    <button
      className={`flex items-center justify-center transition-all duration-300 hover:opacity-80 ${sizeClasses[size]} ${className}`}
      title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
      onClick={toggleTheme}
    >
      <span className='sr-only'>
        {isDarkMode ? '亮色模式' : '暗色模式'}
      </span>

      {isDarkMode ? (
        <>
          <Icon
            name="sun"
            className={`${iconSizes[size]} ${
              isDarkMode ? 'text-yellow-400' : 'text-gray-700'
            }`}
          />
          {showLabel && (
            <span className='ml-2 text-sm font-medium'>
              亮色
            </span>
          )}
        </>
      ) : (
        <>
          <Icon
            name="moon"
            className={`${iconSizes[size]} ${
              isDarkMode ? 'text-blue-300' : 'text-gray-700'
            }`}
          />
          {showLabel && (
            <span className='ml-2 text-sm font-medium'>
              暗色
            </span>
          )}
        </>
      )}
    </button>
  );
}
