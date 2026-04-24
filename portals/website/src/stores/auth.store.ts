/**
 * auth.store.ts
 * @package @vxture/website
 * @layer Presentation
 * @category Stores
 *
 * 功能：
 * - 统一管理所有认证相关全局状态，便于集中维护
 * - 提供登录、登出等基础功能
 * - 只保存界面渲染所需的用户信息，不存任何 token
 *
 * 用途：
 * - 供 UI 组件消费，实现认证流程与用户信息管理
 * - 结构与 themeStore.ts 保持一致，便于团队协作
 *
 * @file auth.store.ts
 * @desc 认证相关全局状态管理，统一支持登录、登出等基础功能
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 */

import { create } from 'zustand';
import axios from 'axios';
import type { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { makeAuthPersistOptions } from './persistOptions/authPersist';
import type { AuthState, UserInfo } from '@/types/auth.types';
import { getProfile, login as loginRequest, logout as logoutRequest } from '@/api/auth.api';

function extractAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401) {
      return '登录失败，请检查账号密码';
    }

    return error.response?.data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : '登录失败，请重试';
}

const authStoreCreator: StateCreator<AuthState> = (set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user: UserInfo | null) => {
    set({ user, isAuthenticated: !!user });
  },

  login: async (identifier: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginRequest({ identifier, password });
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractAuthErrorMessage(error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutRequest();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getProfile();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const isUnauthorized = axios.isAxiosError(error) && error.response?.status === 401;
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: isUnauthorized ? null : extractAuthErrorMessage(error),
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
});

export const useAuthStore = create(
  persist(
    authStoreCreator,
    makeAuthPersistOptions()
  )
);
