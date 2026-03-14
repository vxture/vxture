/**
 * permission.utils.ts - 权限与角色检查工具
 * @package @vxture/core-auth
 *
 * 纯函数，无状态，无副作用。
 * 入参为数据，不依赖任何全局状态或数据库。
 */

import type { AuthUser, PermissionCheckOptions } from '../types/auth.types';

// ============================================================================
// 权限检查
// ============================================================================

/**
 * 检查用户是否拥有指定权限
 *
 * @example
 * hasPermission(user, 'billing:read')
 * hasPermission(user, ['billing:read', 'billing:write'], { mode: 'all' })
 */
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

/**
 * 检查用户是否拥有指定角色
 *
 * @example
 * hasRole(user, 'admin')
 * hasRole(user, ['admin', 'operator'], { mode: 'any' })
 */
export function hasRole(
  user: AuthUser,
  required: string | string[],
  options: PermissionCheckOptions = {},
): boolean {
  const { mode = 'any' } = options;
  const list = Array.isArray(required) ? required : [required];

  // 单角色模型：用户只有一个 role
  return mode === 'all'
    ? list.every((r) => r === user.role)   // 'all' 在单角色下等价于只有一个且匹配
    : list.some((r) => r === user.role);
}

/**
 * 检查用户是否为平台管理员
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * 检查用户是否为租户管理员
 */
export function isTenantAdmin(user: AuthUser): boolean {
  return user.role === 'tenant_admin';
}
