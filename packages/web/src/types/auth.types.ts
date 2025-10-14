/**
 * auth.types.ts
 *
 * 功能：
 * - 统一管理所有认证相关类型，便于集中维护
 * - 提供用户、凭证、响应、认证状态等类型声明
 *
 * 用途：
 * - 供 authStore、AuthSync、认证相关组件/服务统一复用
 * - 结构与 theme.types.ts、i18n.types.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 被 src/stores/authStore.ts 用作状态类型
 * - 被 src/services/authService.ts 用于接口类型
 * - 被认证相关 UI 组件用于类型约束
 *
 * 设计规范：
 * - 只存放类型声明，不包含业务逻辑
 * - 命名、结构、注释与 theme.types/i18n.types 保持一致
 *
 * @file auth.types.ts
 * @desc 认证相关类型定义，统一管理用户、凭证、状态等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/constants/authConfig.ts 认证常量配置
 * @see src/stores/authStore.ts 认证状态管理
 * @see src/services/authService.ts 认证 API 服务
 * @tags auth, types, interface
 * @example
 *   import type { AuthState } from '@/types/auth.types';
 *   const state: AuthState = ...;
 * @remarks
 *   仅存放类型声明，业务逻辑请移至 store/service 层。
 * @todo
 *   支持令牌自动刷新与多端同步登出
 */


// ============================================================================
// 类型定义区 - 认证相关类型声明
// ============================================================================


/**
 * 用户信息类型
 * - 描述认证用户的基础信息、权限等
 * - 可扩展更多字段以适配业务需求
 */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  lastLogin?: number;
  [key: string]: any;
}


/**
 * 登录凭证类型
 * - 用于登录接口的参数约束
 */
export interface LoginCredentials {
  email: string;
  password: string;
}


/**
 * 登录响应类型
 * - 登录接口返回的结构体
 */
export interface LoginResponse {
  user: UserInfo;
  token: string;
  refreshToken: string;
  expiresIn: number;
}


/**
 * Auth Store 状态类型（唯一导出）
 * - 认证全局状态的类型约束，供 Zustand Store 使用
 * - 包含用户、token、权限、定时器、方法等
 */
export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenRefreshTimerId: ReturnType<typeof setTimeout> | null;
  // ================= 方法区 =================

  /**
   * 登录方法
   * @param credentials 登录凭证
   * @returns Promise<void>
   */
  login: (credentials: LoginCredentials) => Promise<void>;

  /**
   * 登出方法
   * @returns Promise<void>
   */
  logout: () => Promise<void>;

  /**
   * 刷新访问令牌
   * @returns Promise<void>
   */
  refreshTokenAction: () => Promise<void>;

  /**
   * 设置 token/refreshToken/过期时间
   * @param token 访问令牌
   * @param refreshToken 刷新令牌
   * @param tokenExpiry 过期时间戳
   */
  setToken: (token: string, refreshToken: string, tokenExpiry: number) => void;

  /**
   * 设置用户信息
   * @param user 用户信息对象
   */
  setUser: (user: UserInfo | null) => void;

  /**
   * 设置令牌自动刷新定时器
   */
  setupTokenRefreshTimer: () => void;

  /**
   * 清除令牌自动刷新定时器
   */
  clearTokenRefreshTimer: () => void;

  /**
   * 权限校验
   * @param permission 权限标识
   * @returns 是否有该权限
   */
  hasPermission: (permission: string) => boolean;

  /**
   * 清除错误信息
   */
  clearError: () => void;
}
