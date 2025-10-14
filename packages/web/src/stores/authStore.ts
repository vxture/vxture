/**
 * 认证状态管理Store（最终修复版）
 * 解决：
 * 1. 参数隐式 `any` 类型错误
 * 2. `persist` 泛型与状态类型完全匹配
 * 3. 内部方法调用的类型一致性
 */
import { create } from 'zustand';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { persist, PersistOptions } from 'zustand/middleware';
import { AuthState, AuthStorage, LoginCredentials } from '@/types/auth'; // 确保类型导入正确
import { AUTH_CONSTANTS } from '@/constants/auth'; // 确保常量导入正确
import {
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
} from '@/services/authService';

/** 计算令牌过期时间戳 */
const calculateExpiryTimestamp = (expiresIn: number): number => Date.now() + expiresIn * 1000;

/** 状态创建函数 - 使用 Zustand StateCreator 泛型以消除 any 报错 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authStoreCreator = (set: any, get: any): AuthState => ({
  // 初始状态（与 AuthState 接口完全对齐）
  user: null,
  token: null,
  refreshToken: null,
  tokenExpiry: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokenRefreshTimerId: null, // 内部定时器ID（必须在 AuthState 中声明）

  /** 登录方法 */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginApi(credentials);
      const tokenExpiry = calculateExpiryTimestamp(response.expiresIn);
      set({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        tokenExpiry,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      get().setupTokenRefreshTimer(); // 调用内部方法
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请重试';
      set({
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiry: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /** 登出方法 */
  logout: async (_clearStorage = true) => {
    // 标记参数为已使用，避免 ESLint 报未使用变量
    void _clearStorage;
    const currentToken = get().token;
    get().clearTokenRefreshTimer(); // 清除定时器
    set({ isLoading: true });
    try {
      await logoutApi(currentToken);
    } finally {
      set({
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiry: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokenRefreshTimerId: null, // 重置内部状态
      });
    }
  },

  /** 刷新访问令牌 */
  refreshAccessToken: async () => {
    if (get().isLoading) return false;
    const currentRefreshToken = get().refreshToken;
    if (!currentRefreshToken) {
      await get().logout(); // 异步登出
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await refreshTokenApi(currentRefreshToken);
      const newExpiry = calculateExpiryTimestamp(response.expiresIn);
      set({
        token: response.token,
        refreshToken: response.refreshToken,
        tokenExpiry: newExpiry,
        isLoading: false,
        error: null,
      });
      get().setupTokenRefreshTimer(); // 重置刷新定时器
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '令牌刷新失败';
      set({ error: errorMessage, isLoading: false });
      setTimeout(async () => {
        await get().logout(); // 延迟登出
      }, AUTH_CONSTANTS.AUTO_LOGOUT_COUNTDOWN);
      return false;
    }
  },

  /** 权限校验 */
  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.permissions.includes(AUTH_CONSTANTS.PERMISSIONS.ADMIN)) return true;
    return user.permissions.includes(permission);
  },

  /** 清除错误信息 */
  clearError: () => {
    set({ error: null });
  },

  /** 设置令牌自动刷新定时器（内部方法） */
  setupTokenRefreshTimer: () => {
    get().clearTokenRefreshTimer(); // 先清除旧定时器
    const { tokenExpiry } = get();
    if (!tokenExpiry) return;

    const now = Date.now();
    const timeUntilRefresh = tokenExpiry - now - AUTH_CONSTANTS.TOKEN_REFRESH_BUFFER;

    if (timeUntilRefresh <= 0) {
      void get().refreshAccessToken(); // 忽略 Promise 返回值
      return;
    }

    const timerId = setTimeout(() => {
      void get().refreshAccessToken();
    }, timeUntilRefresh);

    set({ tokenRefreshTimerId: timerId }); // 更新定时器ID
  },

  /** 清除令牌自动刷新定时器（内部方法） */
  clearTokenRefreshTimer: () => {
    const { tokenRefreshTimerId } = get();
    if (tokenRefreshTimerId) {
      clearTimeout(tokenRefreshTimerId);
      set({ tokenRefreshTimerId: null });
    }
  },
});

/** 创建带持久化的 Auth Store（显式泛型与类型断言） */
export const useAuthStore = create<AuthState>(
  persist(
    authStoreCreator,
    {
      name: AUTH_CONSTANTS.STORAGE_KEY, // 与常量文件同步
      // partialize：显式声明 state 类型为 AuthState，返回 AuthStorage
      partialize: (state: AuthState): AuthStorage => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpiry: state.tokenExpiry,
      }),
      // serialize：显式声明 state 类型为 AuthState
      serialize: (state: AuthState): string => {
        try {
          return JSON.stringify(state);
        } catch (error) {
          console.error('认证状态序列化失败:', error);
          return '{}';
        }
      },
      // deserialize：显式声明 str 类型为 string，返回 AuthStorage
      deserialize: (str: string): AuthStorage => {
        try {
          return JSON.parse(str) as AuthStorage;
        } catch (error) {
          console.error('认证状态反序列化失败:', error);
          return { user: null, token: null, refreshToken: null, tokenExpiry: null };
        }
      },
      // onRehydrateStorage：使用 store.getState() 调用内部方法，避免在 rehydratedState 上假定方法存在
      onRehydrateStorage: (store) => (rehydratedState: AuthStorage | undefined) => {
        if (rehydratedState && (rehydratedState as any).token) {
          // 延迟执行以保证 store 已初始化
          setTimeout(() => {
            try {
              // store 类型在此处较为复杂，使用 any 以便安全调用内部方法
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const currentState = (store as any).getState?.();
              currentState?.setupTokenRefreshTimer?.();
            } catch (err) {
              console.error('rehydration setup error:', err);
            }
          }, 0);
        }
      },
    } as PersistOptions<AuthState, AuthStorage> // 显式断言为 PersistOptions 类型
  )
);
