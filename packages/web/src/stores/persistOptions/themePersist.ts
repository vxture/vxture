import type { PersistOptions } from 'zustand/middleware';
import type { ThemeState } from '@/types/theme.types';
import { THEME_CONSTANTS } from '@/constants/themeConfig';

/**
 * makeThemePersistOptions
 * - 返回适用于 themeStore 的 PersistOptions（包含 version/migrate/partialize/onRehydrateStorage）
 */
export function makeThemePersistOptions(): PersistOptions<ThemeState> {
  const opts = {
    name: THEME_CONSTANTS.STORAGE_KEY,
    version: 1,
    migrate: (persistedState: unknown) => {
      if (!persistedState || typeof persistedState !== 'object') return undefined;
      return persistedState as ThemeState;
    },
    partialize: (state: ThemeState) => ({ theme: state.theme }),
    onRehydrateStorage: (store: { getState?: () => ThemeState }) => (rehydratedState: unknown) => {
      // theme store rehydrate: no heavy side-effects required currently
      // 但保留钩子以便未来扩展（比如根据 theme 更新 document class）
      if (rehydratedState && typeof rehydratedState === 'object') {
        setTimeout(() => {
          try {
            const s = store.getState?.();
            // 可以在此处同步到 DOM 或执行副作用
            void s;
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('theme rehydration error:', err);
          }
        }, 0);
      }
    },
  };

  return opts as unknown as PersistOptions<ThemeState>;
}
