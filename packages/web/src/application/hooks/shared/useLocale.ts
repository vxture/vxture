/**
 * useLocale.ts - 语言管理 Hook
 *
 * Application Layer - Shared Hook
 *
 * 职责：提供获取和切换语言的能力
 *
 * @layer Application
 * @category Hooks - Shared
 */

import { useI18nStore } from '@/stores/i18nStore';

export interface UseLocaleReturn {
  locale: string;
  setLocale: (locale: string) => void;
}

/**
 * 获取当前语言设置的 Hook
 *
 * @example
 * ```tsx
 * function LanguageSwitcher() {
 *   const { locale, setLocale } = useLocale();
 *
 *   return (
 *     <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *       <option value="zh-CN">中文</option>
 *       <option value="en-US">English</option>
 *     </select>
 *   );
 * }
 * ```
 */
export function useLocale(): UseLocaleReturn {
  const store = useI18nStore();

  return {
    locale: store.locale,
    setLocale: store.setLocale,
  };
}