import type { PersistOptions } from 'zustand/middleware';
import type { I18nState } from '@/shared/types/i18n.types';
import { I18N_CONSTANTS } from '@/shared/constants/i18nConfig';

/**
 * makeI18nPersistOptions
 * - 返回适用于 i18nStore 的 PersistOptions（包含 version/migrate/partialize/onRehydrateStorage）
 */
export function makeI18nPersistOptions(): PersistOptions<I18nState> {
  const opts = {
    name: I18N_CONSTANTS.STORAGE_KEY,
    version: 1,
    migrate: (persistedState: unknown) => {
      if (!persistedState || typeof persistedState !== 'object') return undefined;
      return persistedState as I18nState;
    },
    partialize: (state: I18nState) => ({ locale: state.locale }),
    onRehydrateStorage: (store: { getState?: () => I18nState }) => (rehydratedState: unknown) => {
      // 目前 i18n rehydrate 无需副作用处理，但保留位置以备将来使用
      if (rehydratedState && typeof rehydratedState === 'object') {
        setTimeout(() => {
          try {
            const s = store.getState?.();
            void s;
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('i18n rehydration error:', err);
          }
        }, 0);
      }
    },
  };

  return opts as unknown as PersistOptions<I18nState>;
}
