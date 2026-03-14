/**
 * index.ts - 认证工具导出
 * @package @vxture/core-auth
 * @description
 *   认证相关工具函数统一导出
 */

export {
  extractBearerToken,
  extractBearerTokenFromHeaders,
  isTokenExpired,
  getTokenRemainingMs,
} from './auth.utils';

export {
  hasPermission,
  hasRole,
  isAdmin,
  isTenantAdmin,
} from './permission.utils';

export {
  isValidProvider,
  buildOAuthProfile,
  generateJti,
} from './provider.utils';
