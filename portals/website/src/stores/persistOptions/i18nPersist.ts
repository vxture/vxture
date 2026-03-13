import type { PersistOptions } from 'zustand/middleware';
import type { LocaleState } from '@/shared/types/i18n.types';
import { I18N_CONSTANTS } from '@/shared/constants/LocaleConfig';

/**
 * makeI18nPersistOptions
 * - 返回适用于 i18nStore 的 PersistOptions（包含 version/migrate/partialize/onRehydrateStorage）
 */
export function makeI18nPersistOptions(): PersistOptions<LocaleState> {
  const opts = {
    name: I18N_CONSTANTS.STORAGE_KEY,
    version: 1,
    migrate: (persistedState: unknown) => {
      if (!persistedState || typeof persistedState !== 'object') return undefined;
      return persistedState as LocaleState;
    },
    partialize: (state: LocaleState) => ({ locale: state.locale }),
    onRehydrateStorage: (store: { getState?: () => LocaleState }) => (rehydratedState: unknown) => {
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

  return opts as unknown as PersistOptions<LocaleState>;
}
