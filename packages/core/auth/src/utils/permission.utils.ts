/**
 * permission.utils.ts - 权限与角色检查工具
 * @package @vxture/core-auth
 * @description
 *   权限检查、角色验证、管理员判断等工具函数。
 */

import type { AuthUser, PermissionCheckOptions } from '../types';
import { PlatformRole } from '../types';

// ============================================================================
// 权限检查
// ============================================================================

export function hasPermission(
  user: AuthUser,
  required: string | string[],
  options: PermissionCheckOptions = {},
): boolean {
  const { mode = 'any' } = options;
  const list = Array.isArray(required) ? required : [required];
  const userPerms = new Set(user.permissions);

  return mode === 'all'
    ? list.every((p) => userPerms.has(p))
    : list.some((p) => userPerms.has(p));
}

// ============================================================================
// 角色检查
// ============================================================================

export function hasRole(
  user: AuthUser,
  required: string | string[],
  options: PermissionCheckOptions = {},
): boolean {
  const { mode = 'any' } = options;
  const list = Array.isArray(required) ? required : [required];

  return mode === 'all'
    ? list.every((r) => r === user.role)
    : list.some((r) => r === user.role);
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === PlatformRole.ADMIN;
}

export function isTenantAdmin(user: AuthUser): boolean {
  return user.role === PlatformRole.TENANT_ADMIN;
}
