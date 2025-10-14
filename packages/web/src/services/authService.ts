/**
 * 认证服务
 * 封装所有与认证相关的API调用，与状态管理分离
 */
import { LoginCredentials, LoginResponse } from '@/types/auth';
import { AUTH_CONSTANTS } from '@/constants/auth';

/**
 * 模拟API请求工具函数
 * 实际项目中可替换为真实的HTTP客户端（如axios）
 */
const apiClient = {
  post: async <T>(url: string, data: unknown): Promise<T> => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 模拟登录请求
    if (url === AUTH_CONSTANTS.API_ENDPOINTS.LOGIN) {
      const { email } = data as LoginCredentials;

      // 模拟错误情况：如果邮箱包含"error"
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

    // 模拟刷新Token请求
    if (url === AUTH_CONSTANTS.API_ENDPOINTS.REFRESH_TOKEN) {
      return {
        token: 'tok_' + Math.random().toString(36).substr(2, 15),
        refreshToken: 'ref_' + Math.random().toString(36).substr(2, 15),
        expiresIn: AUTH_CONSTANTS.DEFAULT_TOKEN_EXPIRY,
      } as unknown as T;
    }

    throw new Error(`未实现的API端点: ${url}`);
  },

  delete: async <T>(url: string): Promise<T> => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {} as T;
  },
};

/**
 * 登录API调用
 * @param credentials 登录凭证
 * @returns 登录响应数据
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
 * 登出API调用
 * @param token 当前令牌
 */
export const logout = async (token: string | null): Promise<void> => {
  if (!token) return;

  try {
    await apiClient.delete<void>(AUTH_CONSTANTS.API_ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error('登出请求失败:', error);
    // 登出API失败仍继续，因为客户端状态需要清理
  }
};

/**
 * 刷新访问令牌
 * @param refreshToken 刷新令牌
 * @returns 新的令牌信息
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
