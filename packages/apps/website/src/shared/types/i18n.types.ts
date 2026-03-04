/**
 * i18n.types.ts
 *
 * 功能：
 * - 统一管理所有多语言（i18n）相关类型，便于集中维护
 * - 提供 LocaleType、I18nConfig、I18nState、翻译资源等类型声明
 *
 * 用途：
 * - 供 i18nStore、I18nSync、语言切换相关组件/服务统一复用
 * - 结构与 auth.types.ts、theme.types.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 被 src/stores/i18nStore.ts 用作状态类型
 * - 被 src/components/common/I18nSync.tsx 用于副作用聚合
 * - 被语言切换相关 UI 组件用于类型约束
 *
 * 设计规范：
 * - 只存放类型声明，不包含业务逻辑
 * - 命名、结构、注释与 auth.types/theme.types 保持一致
 *
 * @file i18n.types.ts
 * @desc 多语言（i18n）相关类型定义，统一管理 LocaleType、配置、状态等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/constants/i18nConfig.ts 国际化常量配置
 * @see src/stores/i18nStore.ts 国际化状态管理
 * @see src/components/common/I18nSync.tsx 国际化副作用聚合
 * @tags i18n, types, interface
 * @example
 *   import type { I18nState } from '@/types/i18n.types';
 *   const state: I18nState = ...;
 * @remarks
 *   仅存放类型声明，业务逻辑请移至 store/service 层。
 * @todo
 *   支持异步加载远程翻译资源与多语言切换
 */


// ============================================================================
// 类型定义区 - 多语言（i18n）相关类型声明
// ============================================================================


/**
 * 支持的语言类型
 * - 约束所有可用 locale 字符串
 * - 可扩展更多区域标识
 */
export type LocaleType = 'zh-CN' | 'en-US' | string;


/**
 * 单个语言配置项
 * - 描述一种语言的 locale、展示名、图标等
 * - 可扩展更多配置
 */
export interface I18nConfig {
  locale: LocaleType;
  displayName: string;
  icon?: string; // 可选，UI展示用
  // 可扩展更多配置
}


/**
 * 翻译资源类型（key-value 结构）
 * - 约束所有翻译文本的键值对结构
 */
export type I18nResource = Record<string, string>;


/**
 * 全局 i18n 状态类型
 * - 多语言相关全局状态的类型约束，供 Zustand Store 使用
 * - 包含当前语言、可用语言、翻译函数、切换方法等
 */
export interface I18nState {
  locale: LocaleType;
  availableLocales: I18nConfig[];

  // ================= 方法区 =================

  /**
   * 翻译函数
   * @param key 翻译 key
   * @returns 翻译文本
   */
  t: (key: string) => string;

  /**
   * 设置当前语言
   * @param locale 语言标识
   */
  setLocale: (locale: LocaleType) => void;

  // 可扩展更多方法，如 loadResource、syncWithBrowser 等
}
