/**
 * i18nConfig.ts
 *
 * 功能：
 * - 统一管理所有多语言（i18n）相关全局常量配置，便于集中维护
 * - 提供可用语言、默认语言、localStorage key、HTML 属性名等静态配置项
 *
 * 用途：
 * - 供 i18nStore、I18nSync、语言切换相关组件/服务统一复用
 * - 结构与 authConfig.ts、themeConfig.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 被 src/stores/i18nStore.ts 用作状态初始值和持久化配置
 * - 被 src/components/common/I18nSync.tsx 用于同步 DOM 属性
 * - 被语言切换相关 UI 组件用于渲染语言选项
 *
 * 设计规范：
 * - 只存放静态常量，不包含业务逻辑
 * - 命名、结构、注释与 authConfig/themeConfig 保持一致
 *
 * @file i18nConfig.ts
 * @desc 多语言相关全局常量配置，统一管理可用语言、默认语言等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/types/i18n.types.ts 国际化类型定义
 * @see src/stores/i18nStore.ts 国际化状态管理
 * @see src/components/common/I18nSync.tsx 国际化副作用聚合
 * @tags i18n, config, constants
 * @example
 *   import { I18N_CONSTANTS } from '@/constants/i18nConfig';
 *   I18N_CONSTANTS.STORAGE_KEY;
 * @remarks
 *   仅存放常量，业务逻辑请移至 store/service 层。
 * @todo
 *   支持更多多语言相关配置项扩展
 */

// ============================================================================
// 常量定义区 - 多语言（i18n）相关全局配置
// ============================================================================
export const I18N_CONSTANTS = {
  /** 本地存储键名（localStorage key） */
  STORAGE_KEY: 'locale-storage',

  /** HTML 属性名（如 lang） */
  HTML_LANG_ATTRIBUTE: 'lang',

  /** 默认语言（与 Next.js 默认保持一致） */
  DEFAULT_LOCALE: 'zh-CN',

  /** 可用语言列表（可扩展更多语言） */
  AVAILABLE_LOCALES: [
    { locale: 'zh-CN', displayName: '简体中文', icon: '🇨🇳' },
    { locale: 'en-US', displayName: 'English', icon: '🇺🇸' },
    // 可扩展更多语言
  ],

  /** meta 标签选择器（用于同步 content-language） */
  META_SELECTOR: 'meta[http-equiv="content-language"]',
};
