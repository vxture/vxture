/**
 * auth.types.ts - 认证相关类型定义
 * @package @vxture/core-auth
 *
 * Description: 包含认证、会话、权限等相关类型定义
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Types - Auth
 */

// ============================================================================
// User Information
// ============================================================================

/**
 * 用户信息接口
 * @interface User
 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户邮箱 */
  email: string;
  /** 用户姓名 */
  name: string;
  /** 用户头像URL */
  avatar?: string;
  /** 用户角色 */
  role?: string;
  /** 用户权限 */
  permissions?: string[];
  /** 账户状态 */
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  /** 最后登录时间 */
  lastLogin?: Date;
  /** 附加用户数据 */
  [key: string]: any;
}

// ============================================================================
// Auth Token
// ============================================================================

/**
 * 认证令牌接口
 * @interface AuthToken
 */
export interface AuthToken {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken?: string;
  /** 令牌类型 */
  tokenType?: string;
  /** 过期时间（毫秒） */
  expiresIn?: number;
  /** 过期时间戳 */
  expiresAt?: Date;
}

// ============================================================================
// Auth Session
// ============================================================================

/**
 * 认证会话接口
 * @interface AuthSession
 */
export interface AuthSession {
  /** 会话ID */
  id: string;
  /** 用户信息 */
  user: User;
  /** 认证令牌 */
  token: AuthToken;
  /** 会话开始时间 */
  startTime: Date;
  /** 最后活动时间 */
  lastActivityTime: Date;
  /** 会话过期时间 */
  expiresAt: Date;
  /** 设备信息 */
  device?: string;
  /** IP地址 */
  ip?: string;
}

// ============================================================================
// Auth Configuration
// ============================================================================

/**
 * 认证配置接口
 * @interface AuthConfig
 */
export interface AuthConfig {
  /** 启用/禁用 localStorage 存储 */
  enableLocalStorage?: boolean;
  /** 启用/禁用 session storage 存储 */
  enableSessionStorage?: boolean;
  /** 令牌在存储中的键 */
  tokenKey?: string;
  /** 会话在存储中的键 */
  sessionKey?: string;
  /** 令牌类型 */
  tokenType?: string;
  /** 过期时间阈值（秒） */
  expirationMargin?: number;
  /** 自动刷新令牌 */
  autoRefreshToken?: boolean;
  /** 刷新令牌间隔（秒） */
  refreshTokenInterval?: number;
}

// ============================================================================
// Check Options
// ============================================================================

/**
 * 权限检查选项接口
 * @interface PermissionCheckOptions
 */
export interface PermissionCheckOptions {
  /** 检查类型：'all'（AND）或 'any'（OR） */
  checkType?: 'all' | 'any';
  /** 未登录时是否跳过检查 */
  skipIfNotLoggedIn?: boolean;
}

/**
 * 角色检查选项接口
 * @interface RoleCheckOptions
 */
export interface RoleCheckOptions {
  /** 检查类型：'all'（AND）或 'any'（OR） */
  checkType?: 'all' | 'any';
  /** 未登录时是否跳过检查 */
  skipIfNotLoggedIn?: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * 默认认证配置
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  enableLocalStorage: true,
  enableSessionStorage: true,
  tokenKey: 'auth-token',
  sessionKey: 'auth-session',
  tokenType: 'Bearer',
  expirationMargin: 600, // 10分钟
  autoRefreshToken: true,
  refreshTokenInterval: 300, // 5分钟
};
