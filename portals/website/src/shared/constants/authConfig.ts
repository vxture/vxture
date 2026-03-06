/**
 * authConfig.ts
 *
 * 功能：
 * - 统一管理所有认证相关全局常量配置，便于集中维护
 * - 提供 token、权限、API 端点等静态配置项
 *
 * 用途：
 * - 供 authStore、AuthSync、认证相关组件/服务统一复用
 * - 结构与 themeConfig.ts、i18nConfig.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 被 src/stores/authStore.ts 用作状态初始值和持久化配置
 * - 被 src/services/authService.ts 用作 API 端点和权限常量
 * - 被认证相关 UI 组件用于权限判断、接口调用
 *
 * 设计规范：
 * - 只存放静态常量，不包含业务逻辑
 * - 命名、结构、注释与 themeConfig/i18nConfig 保持一致
 *
 * @file authConfig.ts
 * @desc 认证相关全局常量配置，统一管理 token、权限、API 端点等
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/types/auth.types.ts 认证类型定义
 * @see src/stores/authStore.ts 认证状态管理
 * @see src/services/authService.ts 认证 API 服务
 * @tags auth, config, constants
 * @example
 *   import { AUTH_CONSTANTS } from '@/shared/constants/authConfig';
 *   AUTH_CONSTANTS.STORAGE_KEY;
 * @remarks
 *   仅存放常量，业务逻辑请移至 store/service 层。
 * @todo
 *   支持更多认证相关配置项扩展
 */

// ============================================================================
// 常量定义区 - 认证相关全局配置
// ============================================================================
export const AUTH_CONSTANTS = {
  /** 本地存储键名（localStorage key） */
  STORAGE_KEY: 'auth-storage',

  /** Token 提前刷新时间（毫秒）- 在过期前30秒开始尝试刷新 */
  TOKEN_REFRESH_BUFFER: 30 * 1000,

  /** 默认的Token有效期（秒）- 若接口未返回则使用此值 */
  DEFAULT_TOKEN_EXPIRY: 3600, // 1小时

  /** 自动登出倒计时（毫秒） */
  AUTO_LOGOUT_COUNTDOWN: 5 * 1000, // 5秒

  /** 权限相关常量 */
  PERMISSIONS: {
    ADMIN: 'admin',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete',
  } as const,

  /** API 端点配置 */
  API_ENDPOINTS: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
  },
};

