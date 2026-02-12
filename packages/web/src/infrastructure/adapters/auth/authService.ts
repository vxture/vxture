/**
 * authService.ts
 *
 * 功能：
 * - 统一管理所有认证相关异步服务方法，便于集中维护
 * - 提供登录、登出、刷新令牌等 API 封装
 *
 * 用途：
 * - 供 authStore、登录/登出相关组件/服务统一复用
 * - 结构与 i18nService.ts、themeService.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 类型依赖 @/types/auth.types
 * - 常量依赖 @/constants/authConfig
 * - 被 src/stores/authStore.ts、认证相关组件调用
 *
 * 设计规范：
 * - 只存放异步服务方法，不包含业务逻辑
 * - 命名、结构、注释与 i18nService/themeService 保持一致
 *
 * @file authService.ts
 * @desc 认证相关异步服务方法统一封装，便于团队协作与维护
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
 * @tags auth, service, async
 * @example
 *   const res = await login({ email, password });
 *   await logout(token);
 * @remarks
 *   仅存放异步服务方法，业务逻辑请移至 store/组件层。
 * @todo
 *   支持更多认证相关 API 封装
 */

import type { LoginCredentials, LoginResponse } from '@/types/auth.types';
import { AUTH_CONSTANTS } from '@/shared/constants/authConfig';

// ============================================================================
// 内部工具区 - 模拟 API 客户端
// ============================================================================

/**
 * 模拟 API 请求工具函数（实际项目中可替换为真实 HTTP 客户端，如 axios）
 */
const apiClient = {
  /**
   * 模拟 POST 请求
   * @param _url API 路径
   * @param data 请求体
   */
  post: async <T>(_url: string, data: unknown): Promise<T> => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 模拟登录请求
    if (_url === AUTH_CONSTANTS.API_ENDPOINTS.LOGIN) {
      const { email } = data as LoginCredentials;
      // 模拟错误情况：如果邮箱包含 "error"
      if (email.includes('error')) {
        throw new Error('登录失败：无效的邮箱或密码');
      }
      // 模拟成功响应
      return {
        user: {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          name: '测试用户',
          email,
          permissions: ['edit', 'view'],
          lastLogin: Date.now(),
        },
        token: 'tok_' + Math.random().toString(36).substr(2, 15),
        refreshToken: 'ref_' + Math.random().toString(36).substr(2, 15),
        expiresIn: AUTH_CONSTANTS.DEFAULT_TOKEN_EXPIRY,
      } as unknown as T;
    }
    // 模拟刷新 Token 请求
    if (_url === AUTH_CONSTANTS.API_ENDPOINTS.REFRESH_TOKEN) {
      return {
        token: 'tok_' + Math.random().toString(36).substr(2, 15),
        refreshToken: 'ref_' + Math.random().toString(36).substr(2, 15),
        expiresIn: AUTH_CONSTANTS.DEFAULT_TOKEN_EXPIRY,
      } as unknown as T;
    }
    throw new Error(`未实现的 API 端点: ${_url}`);
  },
  /**
   * 模拟 DELETE 请求
   * @param _url API 路径
   */
  delete: async <T>(_url: string): Promise<T> => {
    void _url; // 标记参数为已使用，避免 ESLint 未使用变量错误
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {} as T;
  },
};

// ============================================================================
// 主服务方法区 - auth 异步服务方法定义
// ============================================================================

/**
 * 登录 API 调用
 * @param credentials 登录凭证
 * @returns Promise<LoginResponse> 登录响应数据
 * @example
 *   const res = await login({ email, password });
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    return await apiClient.post<LoginResponse>(AUTH_CONSTANTS.API_ENDPOINTS.LOGIN, credentials);
  } catch (error) {
    console.error('登录请求失败:', error);
    throw error instanceof Error ? error : new Error('登录过程中发生错误');
  }
};

/**
 * 登出 API 调用
 * @param token 当前令牌
 * @returns Promise<void>
 * @example
 *   await logout(token);
 */
export const logout = async (token: string | null): Promise<void> => {
  if (!token) return;
  try {
    await apiClient.delete<void>(AUTH_CONSTANTS.API_ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error('登出请求失败:', error);
    // 登出 API 失败仍继续，因为客户端状态需要清理
  }
};

/**
 * 刷新访问令牌
 * @param refreshToken 刷新令牌
 * @returns Promise<{ token, refreshToken, expiresIn }> 新的令牌信息
 * @example
 *   const res = await refreshToken(token);
 */
export const refreshToken = async (
  refreshToken: string | null
): Promise<{
  token: string;
  refreshToken: string;
  expiresIn: number;
}> => {
  if (!refreshToken) {
    throw new Error('没有可用的刷新令牌');
  }
  try {
    return await apiClient.post<{
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>(AUTH_CONSTANTS.API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  } catch (error) {
    console.error('刷新令牌失败:', error);
    throw error instanceof Error ? error : new Error('刷新令牌过程中发生错误');
  }
};

// TODO: 可扩展更多 auth 相关服务方法，如注册、权限校验等
