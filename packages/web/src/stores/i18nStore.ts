/**
 * src/stores/i18nStore.ts - 全局多语言（国际化）状态管理
 *
 * 核心功能：
 *   1. 管理当前语言（locale）和翻译文本（translations）
 *   2. 提供 setLocale 方法支持异步切换语言，自动加载对应翻译
 *   3. 提供 t(key) 工具函数，支持嵌套 key 的高效翻译查找
 *   4. 状态持久化到 localStorage，刷新后自动恢复用户语言偏好
 *
 * 设计理念：
 *   - 类型安全，便于扩展多语言模块
 *   - 兼容异步加载与本地模拟，适配企业级国际化需求
 *   - 适用于 Next.js/React 全局状态管理，推荐在根布局初始化
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 最后更新：2024-10-14
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { I18N_CONFIG } from '@/constants/i18nConfig';

// 支持的语言类型
export type Locale = 'zh-CN' | 'en-US';

// 翻译文本类型（示例结构，实际项目可按模块拆分）
interface Translations {
  common: {
    backToHome: string;
    submit: string;
    cancel: string;
  };
  themeTest: {
    pageTitle: string;
    toggleThemeBtn: string;
  };
  // 其他模块的翻译...
}

// 状态与方法类型
interface I18nState {
  locale: Locale;
  translations: Translations; // 当前语言的翻译文本
  setLocale: (locale: Locale) => Promise<void>; // 切换语言（异步加载翻译）
  t: (key: keyof Translations | `${keyof Translations}.${string}`) => string; // 翻译工具函数
}

// 模拟翻译文本（实际项目可从public/locales/*.json加载）
const translations: Record<Locale, Translations> = {
  'zh-CN': {
    common: {
      backToHome: '返回首页',
      submit: '提交',
      cancel: '取消',
    },
    themeTest: {
      pageTitle: '主题与多语言测试',
      toggleThemeBtn: '切换主题',
    },
  },
  'en-US': {
    common: {
      backToHome: 'Back to Home',
      submit: 'Submit',
      cancel: 'Cancel',
    },
    themeTest: {
      pageTitle: 'Theme & Language Test',
      toggleThemeBtn: 'Toggle Theme',
    },
  },
};

// 创建I18n Store
export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: I18N_CONFIG.defaultLocale, // 默认语言
      translations: translations[I18N_CONFIG.defaultLocale], // 默认翻译文本

      // 切换语言（异步加载翻译，实际项目可改为fetch请求）
      setLocale: async (locale) => {
        // 模拟API请求延迟
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 更新语言和翻译文本
        set({
          locale,
          translations: translations[locale],
        });
      },

      // 翻译工具函数（支持嵌套键，如t('common.submit')）
      t: (key) => {
        const { translations } = get();
        const keys = key.split('.');
        // 递归获取嵌套翻译文本（如translations.common.submit）
        return keys.reduce((obj, k) => {
          if (typeof obj !== 'object' || obj === null) return key; // 找不到时返回原key
          return obj[k as keyof typeof obj] as string;
        }, translations) as string;
      },
    }),
    {
      name: I18N_CONFIG.storageKey,
      partialize: (state) => ({ locale: state.locale }), // 只持久化语言偏好
    }
  )
);
