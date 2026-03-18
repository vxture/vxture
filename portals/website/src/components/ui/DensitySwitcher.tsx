/**
 * DensitySwitcher.tsx
 *
 * 功能：
 * - 布局密度切换按钮，循环切换三档：compact → default → comfortable
 * - 通过 useTheme 的 setDensity 统一管理，ThemeProvider 自动同步
 *   · 持久化到 localStorage（DENSITY_STORAGE_KEY）
 *   · 写入 <html> 上的 density-{value} class，供全局 Tailwind CSS 消费
 * - 图标使用 rows，tooltip 显示当前档位
 *
 * 用途：
 * - 嵌入 Header 工具栏，提供全局密度控制入口
 *
 * 依赖/调用关系：
 * - useTheme from @vxture/design-system（含 density / setDensity）
 * - Icon from @vxture/design-system
 *
 * @file DensitySwitcher.tsx
 * @desc 布局密度切换按钮，三档循环：compact / default / comfortable
 * @author AI-Generated
 * @date 2026-03-18
 * @copyright Copyright (c) 2024-2026 vxture
 * @license MIT
 * @version 2.0.0
 * @dependencies React, useTheme, Icon
 * @category Components - UI
 * @layer Presentation
 */

'use client';

import { useTheme, Icon } from '@vxture/design-system';
import type { Density } from '@vxture/design-system';

// ============================================================================
// 常量
// ============================================================================

/** 三档循环顺序 */
const DENSITY_CYCLE: Density[] = ['compact', 'default', 'comfortable'];

/** 各档位的中文标签 */
const DENSITY_LABELS: Record<Density, string> = {
  compact: '紧凑',
  default: '默认',
  comfortable: '宽松',
};

// ============================================================================
// 类型定义区
// ============================================================================

interface DensitySwitcherProps {
  /** 图标大小 */
  size?: 'small' | 'medium' | 'large';
  /** 自定义类名 */
  className?: string;
  /** 是否显示当前档位文字标签 */
  showLabel?: boolean;
}

// ============================================================================
// 组件实现区
// ============================================================================

export default function DensitySwitcher({
  size = 'medium',
  className = '',
  showLabel = false,
}: DensitySwitcherProps) {
  // 通过 ThemeProvider 内置的 density 管理，自动持久化 + 同步 HTML class
  const { density, setDensity } = useTheme();

  // 图标尺寸配置
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const buttonSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  // 循环切换到下一档
  const handleToggle = () => {
    const currentIndex = DENSITY_CYCLE.indexOf(density);
    // noUncheckedIndexedAccess 严格模式下需要非空断言
    const nextDensity = DENSITY_CYCLE[(currentIndex + 1) % DENSITY_CYCLE.length] ?? 'default';
    setDensity(nextDensity);
  };

  return (
    <button
      className={`flex items-center justify-center transition-all duration-300 hover:opacity-80 ${buttonSizes[size]} ${className}`}
      title={`布局密度：${DENSITY_LABELS[density]}（点击切换）`}
      onClick={handleToggle}
      aria-label={`当前密度：${DENSITY_LABELS[density]}`}
    >
      <span className='sr-only'>切换布局密度</span>
      <Icon name='rows' className={iconSizes[size]} />
      {showLabel && (
        <span className='ml-1 text-xs font-medium'>{DENSITY_LABELS[density]}</span>
      )}
    </button>
  );
}
