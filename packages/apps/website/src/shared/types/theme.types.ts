/**
 * theme.types.ts
 *
 * 功能：
 * - 统一管理所有主题相关类型，便于集中维护
 * - 提供主题名、主题配置、主题状态等类型声明
 *
 * 用途：
 * - 供 themeStore、ThemeSync、主题切换相关组件/服务统一复用
 * - 结构与 auth.types.ts、i18n.types.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 被 src/stores/themeStore.ts 用作状态类型
 * - 被 src/components/common/ThemeSync.tsx 用于副作用聚合
 * - 被主题切换相关 UI 组件用于类型约束
 *
 * 设计规范：
 * - 只存放类型声明，不包含业务逻辑
 * - 命名、结构、注释与 auth.types/i18n.types 保持一致
 *
 * @file theme.types.ts
 * @desc 主题相关类型定义，统一管理主题名、配置、状态等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/constants/themeConfig.ts 主题常量配置
 * @see src/stores/themeStore.ts 主题状态管理
 * @see src/components/common/ThemeSync.tsx 主题副作用聚合
 * @tags theme, types, interface
 * @example
 *   import type { ThemeState } from '@/types/theme.types';
 *   const state: ThemeState = ...;
 * @remarks
 *   仅存放类型声明，业务逻辑请移至 store/service 层。
 * @todo
 *   支持系统主题自动切换与多主题扩展
 */


// ============================================================================
// 类型定义区 - 主题相关类型声明
// ============================================================================


/**
 * 主题类型
 * - 主题名的类型约束，可扩展为 'system'、'auto' 等
 */
export type ThemeType = 'light' | 'dark' | string;


/**
 * 主题配置项类型
 * - 描述单个主题的属性，如名称、展示名、是否为暗色
 * - 可扩展更多配置，如色板、图标等
 */
export interface ThemeConfig {
  name: ThemeType;
  displayName: string;
  isDark: boolean;
  // 可扩展更多配置，如色板、图标等
}


/**
 * 主题全局状态类型
 * - 主题相关全局状态的类型约束，供 Zustand Store 使用
 * - 包含当前主题、可用主题、暗色模式、切换方法等
 */
export interface ThemeState {
  theme: ThemeType;
  availableThemes: ThemeConfig[];
  isDarkMode: boolean;

  // ================= 方法区 =================

  /**
   * 设置主题
   * @param theme 主题名
   */
  setTheme: (theme: ThemeType) => void;

  /**
   * 切换主题（明暗互换）
   */
  toggleTheme: () => void;

  // 可扩展更多方法，如 setSystemTheme、syncWithSystem 等
}
