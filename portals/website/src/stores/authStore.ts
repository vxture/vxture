/**
 * authStore.ts
 *
 * 功能：
 * - 统一管理所有认证相关全局状态，便于集中维护
 * - 提供登录、登出、token 刷新、权限校验等能力
 *
 * 用途：
 * - 供 UI 组件消费，实现认证流程与用户信息管理
 * - 结构与 themeStore.ts、i18nStore.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - Zustand + persist 实现状态与本地存储同步
 * - 被 src/components/layout/Header.tsx、认证相关组件消费
 * - 类型全部引用 auth.types.ts
 * - 认证相关 API 由 authService.ts 提供
 *
 * 设计规范：
 * - 只存放状态与方法，不包含 UI 逻辑
 * - 命名、结构、注释与 themeStore/i18nStore 保持一致
 *
 * @file authStore.ts
 * @desc 认证相关全局状态管理，统一支持登录、登出、token 刷新等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/types/auth.types.ts 认证类型定义
 * @see src/constants/authConfig.ts 认证常量配置
 * @see src/services/authService.ts 认证 API 服务
 * @tags auth, store
 * @example
 *   const { user, login, logout } = useAuthStore();
 *   await login({ username, password });
 *   logout();
 * @remarks
 *   仅持久化必要字段，业务逻辑请移至组件/服务层。
 * @todo
 *   支持多端同步登出与 token 自动刷新
 */

// ============================================================================
// 依赖导入
// ============================================================================
import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { makeAuthPersistOptions } from './persistOptions/authPersist';
import { AuthState, LoginCredentials, LoginResponse, UserInfo } from '@/shared/types/auth.types';
import { AUTH_CONSTANTS } from '@/shared/constants/authConfig';
import {
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
} from '@/infrastructure/adapters/auth/authService';

// ============================================================================
// 工具函数 - 令牌过期时间戳计算
// ============================================================================
/**
 * 计算令牌过期时间戳
 * @param expiresIn 有效期（秒）
 * @returns 到期时间戳（毫秒）
 */
const calculateExpiryTimestamp = (expiresIn: number): number => Date.now() + expiresIn * 1000;

// ============================================================================
// Store 创建 - 使用 Zustand + persist 中间件
// - 仅持久化必要字段，token/refreshToken 建议加密存储
// ============================================================================
const authStoreCreator: StateCreator<AuthState> = (set, get) => ({
  /** 设置 token/refreshToken/过期时间 */
  setToken: (token: string, refreshToken: string, tokenExpiry: number) => {
    set({ token, refreshToken, tokenExpiry });
  },

  /** 设置用户信息 */
  setUser: (user: UserInfo | null) => {
    set({ user });
  },

  /** 用户信息 */
  user: null,
  /** 访问令牌 */
  token: null,
  /** 刷新令牌 */
  refreshToken: null,
  /** 令牌过期时间戳 */
  tokenExpiry: null,
  /** 是否已认证 */
  isAuthenticated: false,
  /** 加载中状态 */
  isLoading: false,
  /** 错误信息 */
  error: null,
  /** 令牌刷新定时器ID */
  tokenRefreshTimerId: null,

  /** 登录方法 */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response: LoginResponse = await loginApi(credentials);
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
      get().setupTokenRefreshTimer();
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
    void _clearStorage;
    const currentToken = get().token;
    get().clearTokenRefreshTimer();
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
        tokenRefreshTimerId: null,
      });
    }
  },

  /** 刷新访问令牌 */
  refreshTokenAction: async () => {
    if (get().isLoading) return;
    const currentRefreshToken = get().refreshToken;
    if (!currentRefreshToken) {
      await get().logout();
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response: { token: string; refreshToken: string; expiresIn: number } =
        await refreshTokenApi(currentRefreshToken);
      const newExpiry = calculateExpiryTimestamp(response.expiresIn);
      set({
        token: response.token,
        refreshToken: response.refreshToken,
        tokenExpiry: newExpiry,
        isLoading: false,
        error: null,
      });
      get().setupTokenRefreshTimer();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '令牌刷新失败';
      set({ error: errorMessage, isLoading: false });
      setTimeout(async () => {
        await get().logout();
      }, AUTH_CONSTANTS.AUTO_LOGOUT_COUNTDOWN);
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
    get().clearTokenRefreshTimer();
    const { tokenExpiry } = get();
    if (!tokenExpiry) return;

    const now = Date.now();
    const timeUntilRefresh = tokenExpiry - now - AUTH_CONSTANTS.TOKEN_REFRESH_BUFFER;

    if (timeUntilRefresh <= 0) {
      void get().refreshTokenAction();
      return;
    }

    const timerId = setTimeout(() => {
      void get().refreshTokenAction();
    }, timeUntilRefresh);

    set({ tokenRefreshTimerId: timerId });
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

// ============================================================================
// Store 导出 - 带持久化的 Auth Store
// ============================================================================
export const useAuthStore = create(
  persist(
    authStoreCreator,
    // 使用 store-specific persist options，以支持 version/migrate/onRehydrate
    makeAuthPersistOptions()
  )
);
