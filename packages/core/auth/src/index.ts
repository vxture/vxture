/**
 * index.ts - @vxture/core-auth package entry
 * @package @vxture/core-auth
 * @description
 *   Authentication token management and session infrastructure
 */

// Types
export { OAuthProviderType, PlatformRole, JwtUserType } from './types';
export type {
  JwtAccessPayload,
  JwtRefreshPayload,
  AuthUser,
  OAuthTokens,
  OAuthUserProfile,
  OAuthProvider,
  AuthTokenPair,
  PermissionCheckOptions,
} from './types';

// JWT Client
export { VxJwtClient } from './client';

// Guards
export { JwtAuthGuard, RolesGuard } from './guards';

// Decorators
export { Public, IS_PUBLIC_KEY, Roles, ROLES_KEY, CurrentUser } from './decorators';

// Utils
export {
  extractBearerToken,
  extractBearerTokenFromHeaders,
  isTokenExpired,
  getTokenRemainingMs,
  hasPermission,
  hasRole,
  isAdmin,
  isTenantAdmin,
  isValidProvider,
  buildOAuthProfile,
  generateJti,
} from './utils';
