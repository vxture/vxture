/**
 * themeConfig.ts
 *
 * 功能：
 * - 统一管理所有主题相关全局常量配置，便于集中维护
 * - 提供主题名、class、可用主题列表等静态配置项
 *
 * 用途：
 * - 供 themeStore、ThemeSync、主题切换相关组件/服务统一复用
 * - 结构与 authConfig.ts、i18nConfig.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 被 src/stores/themeStore.ts 用作状态初始值和持久化配置
 * - 被 src/components/common/ThemeSync.tsx 用于同步 DOM 属性和 class
 * - 被主题切换相关 UI 组件用于渲染主题选项
 *
 * 设计规范：
 * - 只存放静态常量，不包含业务逻辑
 * - 命名、结构、注释与 authConfig/i18nConfig 保持一致
 *
 * @file themeConfig.ts
 * @desc 主题相关全局常量配置，统一管理主题名、class、可用主题等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/types/theme.types.ts 主题类型定义
 * @see src/stores/themeStore.ts 主题状态管理
 * @see src/components/common/ThemeSync.tsx 主题副作用聚合
 * @tags theme, config, constants
 * @example
 *   import { THEME_CONSTANTS } from '@/constants/themeConfig';
 *   THEME_CONSTANTS.STORAGE_KEY;
 * @remarks
 *   仅存放常量，业务逻辑请移至 store/service 层。
 * @todo
 *   支持更多主题相关配置项扩展
 */

// ============================================================================
// 常量定义区 - 主题相关全局配置
// ============================================================================
export const THEME_CONSTANTS = {
  /** 本地存储键名（localStorage key） */
  STORAGE_KEY: 'theme-storage',

  /** HTML 属性名（如 data-theme） */
  THEME_ATTRIBUTE: 'data-theme',

  /** 深色模式类名（用于 TailwindCSS dark 方案） */
  DARK_CLASS: 'dark',

  /** 默认主题（与 Tailwind 默认保持一致） */
  DEFAULT_THEME: 'light',

  /** 可用主题列表（可扩展更多主题） */
  AVAILABLE_THEMES: [
    { name: 'light', displayName: '浅色', isDark: false },
    { name: 'dark', displayName: '深色', isDark: true },
    // 可扩展更多主题
  ],
};
