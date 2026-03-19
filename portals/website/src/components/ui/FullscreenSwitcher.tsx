/**
 * FullscreenSwitcher.tsx
 *
 * 功能：
 * - 全屏切换按钮，支持两种模式：
 *   · pseudo（工作区全屏）：CSS 模拟全屏，无浏览器权限要求，ESC 可退出
 *   · native（显示器全屏）：调用浏览器原生 Fullscreen API，真正全屏
 * - 图标根据全屏状态自动切换（corners-out / corners-in）
 * - 通过 useFullscreen 消费 FullscreenProvider 的状态
 *
 * 用途：
 * - 嵌入 Header 工具栏，提供全局全屏入口
 *
 * 依赖/调用关系：
 * - useFullscreen from @vxture/design-system
 * - FullscreenProvider 必须在上层（layout.tsx）挂载
 *
 * @file FullscreenSwitcher.tsx
 * @desc 全屏切换按钮，支持 pseudo / native 双模式
 * @author AI-Generated
 * @date 2026-03-18
 * @copyright Copyright (c) 2024-2026 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, useFullscreen, Icon
 * @category Components - UI
 * @layer Presentation
 */

'use client';

import { useRef } from 'react';
import { useFullscreen, Icon } from '@vxture/design-system';
import type { FullscreenMode, FullscreenOptions } from '@vxture/design-system';

// ============================================================================
// 类型定义区
// ============================================================================

interface FullscreenSwitcherProps {
  /** 全屏目标 ID，对应 FullscreenContainer 的 id */
  targetId?: string;
  /** 全屏模式：pseudo = 工作区全屏，native = 显示器全屏 */
  mode?: FullscreenMode;
  /**
   * 是否禁止页面滚动，覆盖 FullscreenProvider 的 defaultLockScroll
   * 不传则沿用 Provider 全局配置（默认 true）
   */
  lockScroll?: boolean;
  /** 图标尺寸类名 */
  className?: string;
  /** 图标大小 */
  size?: 'small' | 'medium' | 'large';
}

// ============================================================================
// 常量
// ============================================================================

/** 全局页面全屏的目标 ID */
const PAGE_FULLSCREEN_ID = 'page-root';

// ============================================================================
// 组件实现区
// ============================================================================

export default function FullscreenSwitcher({
  targetId = PAGE_FULLSCREEN_ID,
  mode = 'pseudo',
  lockScroll,
  className = '',
  size = 'medium',
}: FullscreenSwitcherProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const { isFullscreen, targetId: activeId, toggle } = useFullscreen();

  // 当前按钮是否处于全屏激活状态
  const isActive = isFullscreen && activeId === targetId;

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

  // 全屏标题提示
  const titleMap: Record<FullscreenMode, string> = {
    pseudo: isActive ? '退出工作区全屏' : '工作区全屏',
    native: isActive ? '退出显示器全屏' : '显示器全屏',
  };

  // 切换全屏：pseudo 模式操作 document.documentElement，native 模式同理
  const handleToggle = () => {
    const target = document.documentElement;
    containerRef.current = target;
    toggle(targetId, target, mode);
  };

  return (
    <button
      className={`flex items-center justify-center transition-all duration-300 hover:opacity-80 ${buttonSizes[size]} ${className}`}
      title={titleMap[mode]}
      onClick={handleToggle}
      aria-pressed={isActive}
    >
      <span className='sr-only'>{titleMap[mode]}</span>
      <Icon
        name={isActive ? 'corners-in' : 'corners-out'}
        className={iconSizes[size]}
      />
    </button>
  );
}
