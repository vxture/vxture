/**
 * ThemeSync.tsx
 *
 * 功能：
 * - 统一管理全局主题副作用，自动同步 <html> 属性和 class
 * - 检查并持久化本地存储中的主题设置，保证刷新/切换时状态一致
 * - 可扩展：监听系统主题变化、动态切换主题、埋点等副作用
 *
 * 用途：
 * - 保证客户端与服务端渲染主题一致性
 * - 提升用户体验与品牌一致性
 * - 结构与 I18nSync、AuthSync 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - useThemeStore 获取主题状态
 * - THEME_CONSTANTS 统一配置
 * - 被 src/app/layout.tsx、ClientSyncAgg.tsx 挂载
 *
 * 设计规范：
 * - 只负责副作用逻辑，不包含 UI 渲染
 * - 命名、结构、注释与 I18nSync/AuthSync 保持一致
 *
 * @file ThemeSync.tsx
 * @desc 全局副作用聚合组件，负责同步主题到 DOM 属性和 class，确保应用主题状态与页面环境一致。
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/stores/themeStore.ts 主题状态管理
 * @see src/constants/themeConfig.ts 主题常量配置
 * @tags theme, global-sync
 * @example <ThemeSync />
 * @remarks 推荐在 src/app/layout.tsx 根组件中挂载，确保全局副作用统一生效。
 * @todo 支持系统主题自动切换
 */

'use client';
import { useThemeStore } from '@/stores/themeStore';
import { THEME_CONSTANTS } from '@/shared/constants/themeConfig';
import { useEffect } from 'react';
export default function ThemeSync() {
  const { theme } = useThemeStore();

  // 同步主题到 <html> 属性
  useEffect(() => {
    if (!theme) return;
    document.documentElement.setAttribute(THEME_CONSTANTS.THEME_ATTRIBUTE, theme);
    if (theme === THEME_CONSTANTS.DARK_CLASS) {
      document.documentElement.classList.add(THEME_CONSTANTS.DARK_CLASS);
    } else {
      document.documentElement.classList.remove(THEME_CONSTANTS.DARK_CLASS);
    }
  }, [theme]);

  // 可扩展：监听系统主题变化、持久化、上报等副作用

  return null;
}
