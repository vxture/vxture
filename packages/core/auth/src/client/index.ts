/**
 * client/index.ts - 认证客户端导出
 * @package @vxture/core-auth
 *
 * Description: 认证客户端类和工具的统一导出文件
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Client - Auth
 */

export * from './auth.client';
export { AuthManager, AuthStorage, PermissionManager } from './auth.client';
export { getAuthManager, getPermissionManager } from './auth.client';
