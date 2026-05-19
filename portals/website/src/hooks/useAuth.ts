/**
 * useAuth.ts - 认证操作 Hook
 * @package @vxture/website
 * @layer Presentation
 * @category Hooks
 *
 * 职责：调用 BFF auth 接口，完成后更新 authStore 状态
 *
 * @file useAuth.ts
 * @desc 认证操作 Hook，调用 BFF 接口并管理 authStore 状态
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 */

import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const {
    login: loginStore,
    signup: signupStore,
    logout: logoutStore,
    isLoading,
    error,
  } = useAuthStore();

  const login = async (
    identifier: string,
    password: string,
    turnstileToken?: string,
  ) => {
    await loginStore(identifier, password, turnstileToken);
  };

  const signup = async (
    email: string,
    name: string,
    password: string,
    turnstileToken?: string,
  ) => {
    await signupStore(email, name, password, turnstileToken);
  };

  const logout = async () => {
    await logoutStore();
  };

  return { login, signup, logout, isLoading, error };
}
