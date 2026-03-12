/**
 * 临时的认证服务适配器，用于保持 authStore 兼容性
 * 实际应该使用 src/api/auth.ts 中定义的 API
 */

import * as authApi from '@/api/auth';
import type { LoginCredentials, LoginResponse, UserInfo } from '@/shared/types/auth.types';

// 转换类型
function convertAuthResponse(response: any): LoginResponse {
  return {
    token: response.token,
    refreshToken: '', // 临时值，实际应该从响应中获取
    expiresIn: 3600, // 临时值，实际应该从响应中获取
    user: {
      id: response.user.id,
      username: response.user.email.split('@')[0],
      email: response.user.email,
      permissions: ['user'],
    },
  };
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await authApi.login({
    email: credentials.username,
    password: credentials.password,
  });
  return convertAuthResponse(response);
}

export async function logout(token: string | null): Promise<void> {
  await authApi.logout();
}

export async function refreshToken(refreshToken: string): Promise<{
  token: string;
  refreshToken: string;
  expiresIn: number;
}> {
  // 临时实现
  return {
    token: '',
    refreshToken: '',
    expiresIn: 3600,
  };
}
