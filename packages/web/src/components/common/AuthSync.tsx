/**
 * AuthSync.tsx
 *
 * 功能：
 * - 统一管理全局认证副作用，定时检查本地存储中的认证信息，自动判断 token 是否过期，过期后自动登出
 * - 监听页面可见性变化，激活时再次检查，防止长时间挂起导致的安全隐患
 * - 可扩展：令牌自动刷新、多端同步登出、埋点等副作用
 *
 * 用途：
 * - 保证客户端与服务端渲染认证状态一致性
 * - 提升安全性与用户体验
 * - 结构与 ThemeSync、I18nSync 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - useAuthStore 获取认证状态
 * - AUTH_CONSTANTS 统一配置
 * - 被 src/app/layout.tsx、ClientSyncAgg.tsx 挂载
 *
 * 设计规范：
 * - 只负责副作用逻辑，不包含 UI 渲染
 * - 命名、结构、注释与 ThemeSync/I18nSync 保持一致
 *
 * @file AuthSync.tsx
 * @desc 全局副作用聚合组件，负责令牌过期检查与自动登出，确保认证状态与页面环境一致。
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/stores/authStore.ts 认证状态管理
 * @see src/constants/authConfig.ts 认证常量配置
 * @tags auth, global-sync
 * @example <AuthSync />
 * @remarks 推荐在 src/app/layout.tsx 根组件中挂载，确保全局副作用统一生效。
 * @todo 支持令牌自动刷新与多端同步登出
 */

'use client';
import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AUTH_CONSTANTS } from '@/constants/authConfig';

interface AuthStorage extends Record<string, unknown> {
  timestamp: number;
  expiresAt?: number;
  expiresIn?: number;
}

export default function AuthSync(): null {
  const { token, logout } = useAuthStore();

  const checkTokenExpiry = useCallback(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEY);
      if (!storedAuth) return;
      const parsed = JSON.parse(storedAuth) as AuthStorage;
      const now = Date.now();
      if (typeof parsed.timestamp !== 'number' || isNaN(parsed.timestamp)) {
        logout();
        return;
      }
      let expiryMs: number;
      if (typeof parsed.expiresAt === 'number' && !isNaN(parsed.expiresAt)) {
        expiryMs = parsed.expiresAt;
      } else if (typeof parsed.expiresIn === 'number' && !isNaN(parsed.expiresIn)) {
        expiryMs = parsed.timestamp + parsed.expiresIn * 1000;
      } else {
        expiryMs = parsed.timestamp + AUTH_CONSTANTS.DEFAULT_TOKEN_EXPIRY * 1000;
      }
      if (now > expiryMs) {
        logout();
        return;
      }
  // =============================
  // 可扩展点（扩展副作用逻辑）
  // =============================
  // 例如：
  // - 令牌接近到期时自动刷新
  // - 认证状态变更埋点/上报
  // - 多端同步登出
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[认证检查] 令牌过期检查失败:', error);
      }
    }
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    if (isMounted) {
      checkTokenExpiry();
    }
    const CHECK_INTERVAL_MS = 60 * 1000;
    const intervalId = window.setInterval(checkTokenExpiry, CHECK_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        checkTokenExpiry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, checkTokenExpiry]);

  return null;
}
