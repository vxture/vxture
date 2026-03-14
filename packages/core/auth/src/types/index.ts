/**
 * index.ts - 认证类型导出
 * @package @vxture/core-auth
 * @description
 *   认证相关类型统一导出
 */

export {
  OAuthProviderType,
  PlatformRole,
} from './auth.types';

export type {
  JwtAccessPayload,
  JwtRefreshPayload,
  AuthUser,
  OAuthTokens,
  OAuthUserProfile,
  OAuthProvider,
  AuthTokenPair,
  PermissionCheckOptions,
  PlatformRole as PlatformRoleType
} from './auth.types';
