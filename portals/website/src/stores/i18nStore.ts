/**
 * i18nStore.ts
 *
 * 功能：
 * - 统一管理所有多语言（i18n）相关全局状态，便于集中维护
 * - 提供语言切换、翻译文本获取、持久化等能力
 *
 * 用途：
 * - 供 UI 组件消费，实现多语言切换与内容国际化
 * - 结构与 authStore.ts、themeStore.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - Zustand + persist 实现状态与本地存储同步
 * - 被 src/components/layout/Header.tsx、Footer.tsx 等消费
 * - 类型全部引用 i18n.types.ts
 *
 * 设计规范：
 * - 只存放状态与方法，不包含 UI 逻辑
 * - 命名、结构、注释与 authStore/themeStore 保持一致
 *
 * @file i18nStore.ts
 * @desc 多语言相关全局状态管理，统一支持语言切换、翻译文本获取等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/types/i18n.types.ts 国际化类型定义
 * @see src/constants/LocaleConfig.ts 国际化常量配置
 * @tags i18n, store
 * @example
 *   const { locale, setLocale, t } = useI18nStore();
 *   await setLocale('en-US');
 *   t('common.submit'); // => 翻译文本或原 key
 * @remarks
 *   仅持久化 locale 字段，业务逻辑请移至组件/服务层。
 * @todo
 *   支持异步加载远程翻译资源与多语言分组
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { I18N_CONSTANTS } from '@/shared/constants/LocaleConfig';
import { makeI18nPersistOptions } from './persistOptions/i18nPersist';
import type { LocaleType, LocaleConfig, LocaleState, TranslationResource } from '@/shared/types/i18n.types';

// ============================================================================
// 类型定义 - 明确暴露给调用方的类型契约
// ============================================================================
// - 为避免将大量翻译写入 localStorage，本项目只持久化 locale，translations 由内存管理
// ============================================================================

const translations: Record<LocaleType, TranslationResource> = {
  'zh-CN': {
    'common.backToHome': '返回首页',
    'common.submit': '提交',
    'common.cancel': '取消',
    'themeTest.pageTitle': '主题与多语言测试',
    'themeTest.toggleThemeBtn': '切换主题',
  },
  'en-US': {
    'common.backToHome': 'Back to Home',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'themeTest.pageTitle': 'Theme & Language Test',
    'themeTest.toggleThemeBtn': 'Toggle Theme',
  },
};

// ============================================================================
// Store 创建 - 使用 Zustand + persist 中间件
// - 仅持久化 locale 字段，translations 保持内存态，便于按需加载与避免大数据写入 localStorage
// ============================================================================
/**
 * useI18nStore
 * - 全局多语言状态管理 Store
 * - 提供语言切换、翻译文本获取、持久化等能力
 * @returns LocaleState
 */
export const useI18nStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      /** 当前语言（如 'zh-CN' | 'en-US'） */
      locale: I18N_CONSTANTS.DEFAULT_LOCALE,
      /** 可用语言列表 */
      availableLocales: I18N_CONSTANTS.AVAILABLE_LOCALES as LocaleConfig[],
      /**
       * 翻译函数
       * @param key 翻译 key
       * @returns 翻译文本或原 key
       */
      t: (key: string) => {
        const { locale } = get();
        const resource = translations[locale] || {};
        return resource[key] || key;
      },
      /**
       * 设置当前语言
       * @param locale 语言标识
       */
      setLocale: async (locale: LocaleType) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ locale });
      },
    }),
    makeI18nPersistOptions()
  )
);
