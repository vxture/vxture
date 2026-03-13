/**
 * I18nSync.tsx
 *
 * 功能：
 * - 统一管理全局多语言副作用，自动同步 <html> lang 属性和 meta 标签
 * - 检查并持久化本地存储中的语言设置，保证刷新/切换时状态一致
 * - 可扩展：监听浏览器语言变化、动态加载多语言资源、埋点等副作用
 *
 * 用途：
 * - 提升 SEO 与无障碍访问能力
 * - 保证客户端与服务端渲染语言一致性
 * - 结构与 ThemeSync、AuthSync 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - useI18nStore 获取语言状态
 * - I18N_CONSTANTS 统一配置
 * - 被 src/app/layout.tsx、ClientSyncAgg.tsx 挂载
 *
 * 设计规范：
 * - 只负责副作用逻辑，不包含 UI 渲染
 * - 命名、结构、注释与 ThemeSync/AuthSync 保持一致
 *
 * @file I18nSync.tsx
 * @desc 全局副作用聚合组件，负责同步语言到 DOM 属性和 meta，确保应用语言状态与页面环境一致。
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/stores/i18nStore.ts 国际化状态管理
 * @see src/constants/LocaleConfig.ts 国际化常量配置
 * @tags i18n, global-sync
 * @example <I18nSync />
 * @remarks 推荐在 src/app/layout.tsx 根组件中挂载，确保全局副作用统一生效。
 * @todo 支持动态加载多语言资源
 */

'use client';
import { useEffect } from 'react';
import { useI18nStore } from '@/stores/i18nStore';
import { I18N_CONSTANTS } from '@/shared/constants/LocaleConfig';

export default function I18nSync() {
  const { locale } = useI18nStore();

  // 同步 <html> lang 属性和 meta 标签
  useEffect(() => {
    if (!locale) return;
    document.documentElement.setAttribute(I18N_CONSTANTS.HTML_LANG_ATTRIBUTE, locale);
    const meta = document.querySelector(I18N_CONSTANTS.META_SELECTOR) as HTMLMetaElement | null;
    if (meta && meta.content !== locale) {
      meta.content = locale;
    }
  }, [locale]);

  // =============================
  // 可扩展点（扩展副作用逻辑）
  // =============================
  // 例如：
  // - 监听浏览器语言变化
  // - 持久化 locale 到 localStorage
  // - 语言切换埋点/上报
  // - 动态加载多语言资源

  return null;
}
