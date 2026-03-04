/**
 * ThemeToggleButton.tsx
 *
 * 功能：
 * - 统一提供全局主题（light/dark）切换按钮，自动根据当前主题显示太阳/月亮图标
 * - 支持无障碍、响应式、明暗模式适配
 *
 * 用途：
 * - 适用于网站任意位置，便捷切换明暗主题，提升用户体验
 * - 可直接用于 Header、Footer、侧边栏等任意组件
 *
 * 依赖/调用关系：
 * - 依赖 ThemeContext 提供主题状态与切换方法
 * - 依赖 react-icons/fi 图标库
 * - 被全局布局、导航等组件调用
 *
 * 设计规范：
 * - 只负责主题切换按钮 UI 与交互，不包含业务逻辑
 * - 命名、结构、注释与其它通用组件保持一致
 *
 * @file ThemeToggleButton.tsx
 * @desc 全局主题切换按钮通用组件，自动适配明暗模式
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, react-icons
 * @see ../../contexts/ThemeContext
 * @tags theme, toggle, button, component
 * @example
 *   <ThemeToggleButton />
 * @remarks
 *   仅负责主题切换按钮 UI，主题状态请通过 ThemeContext 管理。
 * @todo
 *   支持更多主题色彩与动画扩展
 */

import { useGlobal } from '@/shared/contexts/GlobalContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useGlobal();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
      className='p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors'
    >
      {theme === 'light' ? (
        <FiMoon className='w-5 h-5 text-gray-800' />
      ) : (
        <FiSun className='w-5 h-5 text-yellow-400' />
      )}
    </button>
  );
};

export default ThemeToggleButton;
