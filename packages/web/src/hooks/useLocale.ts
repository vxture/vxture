/**
 * Layer 2: 能力层 - 国际化 Hook
 * 职责：提供获取和切换语言的能力
 *
 * 这是一个包装 Hook，隐藏 Zustand store 的细节
 */

import { useI18nStore } from '@/stores/i18nStore';

export interface UseLocaleReturn {
  locale: string;
  setLocale: (locale: string) => void;
}

/**
 * 获取当前语言设置的 Hook
 *
 * 使用示例：
 * ```tsx
 * function MyComponent() {
 *   const { locale, setLocale } = useLocale()
 *   return (
 *     <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *       <option value="zh-CN">中文</option>
 *       <option value="en-US">English</option>
 *     </select>
 *   )
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
