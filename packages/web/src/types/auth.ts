/**
 * 认证相关类型定义
 * 集中管理所有与认证相关的类型，确保类型安全和一致性
 */

/**
 * 用户信息接口
 * 描述系统中用户的核心信息和权限
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  permissions: string[];
}

/**
 * 本地存储的认证数据结构
 * 定义需要持久化到localStorage的字段
 */
export interface AuthStorage {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

/**
 * 认证状态接口
 * 包含所有认证相关的状态字段
 */
export interface AuthState extends AuthStorage {
  // 派生状态
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenRefreshTimerId: NodeJS.Timeout | number | null; // 浏览器/Node 环境兼容

  // 认证方法
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (clearStorage?: boolean) => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
  setupTokenRefreshTimer: () => void;
  clearTokenRefreshTimer: () => void;
}

/**
 * 登录请求参数接口
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 登录响应数据接口
 */
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number; // 有效期（秒）
}

