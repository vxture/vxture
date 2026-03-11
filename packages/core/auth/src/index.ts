/**
 * index.ts - Vxture Core Authentication and Authorization Package
 * @package @vxture/core-auth
 *
 * Description: Platform authentication and authorization utilities, providing
 * token management, session management, and role-based access control.
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Services - Authentication
 *
 * @remarks
 * - 仅包含认证 token 管理和 session 基础设施，不处理业务权限逻辑
 * - 支持本地存储和会话存储管理
 * - 提供权限和角色检查功能
 *
 * @example
 * ```ts
 * import { AuthManager, getAuthManager, User, AuthToken } from '@vxture/core-auth';
 *
 * const authManager = getAuthManager();
 * const user: User = {
 *   id: '123',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   role: 'admin',
 * };
 * const token: AuthToken = {
 *   accessToken: 'abc123',
 *   refreshToken: 'def456',
 * };
 *
 * authManager.login(user, token);
 * ```
 */

// ============================================================================
// Types Exports
// ============================================================================

export type {
  User,
  AuthToken,
  AuthSession,
  AuthConfig,
  PermissionCheckOptions,
  RoleCheckOptions,
} from './types';
export { DEFAULT_AUTH_CONFIG } from './types';

// ============================================================================
// Client Exports
// ============================================================================

export * from './client';
export { AuthManager, AuthStorage, PermissionManager } from './client';
export { getAuthManager, getPermissionManager } from './client';

// ============================================================================
// Utils Exports
// ============================================================================

// TODO: 将来需要迁移的工具函数放这里
// 注意：core-auth 应该只包含认证基础设施，不包含具体业务权限逻辑
// 其他通用工具应该放在 @vxture/shared
