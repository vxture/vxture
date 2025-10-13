/**
 * useThemeToggleButton.tsx - 主题切换按钮（通用组件）
 *
 * 功能：提供全局主题（light/dark）切换按钮，自动根据当前主题显示太阳/月亮图标
 * 用途：适用于网站任意位置，便捷切换明暗主题，提升用户体验
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 时间：2024-06
 *
 * 代码规范：TypeScript + React Hooks 最佳实践，主题状态通过 ThemeContext 管理
 * 交互体验：按钮无障碍支持，图标随主题动态切换，样式适配明暗模式
 * 复用扩展：可直接用于 Header、Footer、侧边栏等任意组件
 */

import { useTheme } from '../../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const useThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

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

export default useThemeToggleButton;
