import type { PersistOptions } from 'zustand/middleware';
import type { AuthState } from '@/types/auth.types';
import { AUTH_CONSTANTS } from '@/constants/authConfig';

/**
 * makeAuthPersistOptions
 * - 返回适用于 authStore 的 PersistOptions（包含 version/migrate/partialize/onRehydrateStorage）
 */
function hasTokenField(x: unknown): x is { token: string | null } {
  return typeof x === 'object' && x !== null && 'token' in x;
}

export function makeAuthPersistOptions(): PersistOptions<AuthState> {
  const opts = {
    name: AUTH_CONSTANTS.STORAGE_KEY,
    version: 1,
    migrate: (persistedState: unknown) => {
      if (!persistedState || typeof persistedState !== 'object') return undefined;
      return persistedState as AuthState;
    },
    partialize: (state: AuthState) => ({
      token: state.token,
      refreshToken: state.refreshToken,
      tokenExpiry: state.tokenExpiry,
      user: state.user,
    }),
    onRehydrateStorage: (store: { getState?: () => AuthState }) => (rehydratedState: unknown) => {
      if (hasTokenField(rehydratedState)) {
        setTimeout(() => {
          try {
            const currentState = store.getState?.();
            currentState?.setupTokenRefreshTimer?.();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('auth rehydration setup error:', err);
          }
        }, 0);
      }
    },
  };

  // 强制断言为 PersistOptions<AuthState>（类型系统在 partialize 返回子集时可能报错）
  return opts as unknown as PersistOptions<AuthState>;
}
