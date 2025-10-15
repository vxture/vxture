/**
 * themeStore.ts
 *
 * 功能：
 * - 统一管理所有主题相关全局状态，便于集中维护
 * - 提供主题切换、持久化、可扩展多主题等能力
 *
 * 用途：
 * - 供 UI 组件消费，实现主题切换与主题一致性
 * - 结构与 authStore.ts、i18nStore.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - Zustand + persist 实现状态与本地存储同步
 * - 被 src/components/layout/Header.tsx、Footer.tsx 等消费
 * - 类型全部引用 theme.types.ts
 *
 * 设计规范：
 * - 只存放状态与方法，不包含 UI 逻辑
 * - 命名、结构、注释与 authStore/i18nStore 保持一致
 *
 * @file themeStore.ts
 * @desc 主题相关全局状态管理，统一支持主题切换、持久化等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/types/theme.types.ts 主题类型定义
 * @see src/constants/themeConfig.ts 主题常量配置
 * @tags theme, store
 * @example
 *   const { theme, toggleTheme } = useThemeStore();
 *   toggleTheme(); // 切换主题
 * @remarks
 *   仅持久化 theme 字段，业务逻辑请移至组件/服务层。
 * @todo
 *   支持系统主题自动切换与多主题扩展
 */

// ============================================================================
// 依赖导入区
// ============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEME_CONSTANTS } from '@/constants/themeConfig';
import { makeThemePersistOptions } from './persistOptions/themePersist';
import type { ThemeConfig, ThemeState } from '@/types/theme.types';

// ============================================================================
// Store 创建区 - useThemeStore 实现（Zustand + persist）
// - 仅持久化 theme 字段，支持多主题扩展，避免大数据写入 localStorage
// ============================================================================
/**
 * useThemeStore
 * - 全局主题状态管理 Store
 * - 提供主题切换、持久化、暗色模式等能力
 * @returns ThemeState
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      /** 当前主题名（如 'light' | 'dark'） */
      theme: THEME_CONSTANTS.DEFAULT_THEME,
      /** 可用主题列表（如 light/dark/自定义） */
      availableThemes: THEME_CONSTANTS.AVAILABLE_THEMES as ThemeConfig[],
      /** 是否为暗色模式 */
      isDarkMode: THEME_CONSTANTS.DEFAULT_THEME === THEME_CONSTANTS.DARK_CLASS,
      /**
       * 设置主题（支持任意已注册主题）
       * @param theme 主题名
       */
      setTheme: (theme) => {
        if (typeof theme !== 'string') return;
        const next = theme.trim();
        if (!next) return;
        const currentTheme = get().theme;
        if (currentTheme !== next) {
          set({
            theme: next,
            isDarkMode: next === THEME_CONSTANTS.DARK_CLASS,
          });
        }
      },
      /**
       * 切换主题（明暗互换）
       * @returns void
       */
      toggleTheme: () => {
        set((state) => {
          const next =
            state.theme === THEME_CONSTANTS.DARK_CLASS
              ? THEME_CONSTANTS.DEFAULT_THEME
              : THEME_CONSTANTS.DARK_CLASS;
          return {
            theme: next,
            isDarkMode: next === THEME_CONSTANTS.DARK_CLASS,
          };
        });
      },
    }),
    // 使用 store-specific persist options，方便将来做 migrate/side-effects
    makeThemePersistOptions()
  )
);
