/**
 * auth.types.ts - Server-side auth type definitions
 * @package @vxture/core-auth
 * @description
 *   Platform-level authentication related types: JWT payloads, AuthUser, OAuth Provider interfaces, role enums, etc.
 * 
 * @author AI-Generated
 * @date 2026-03-15
 */

// ============================================================================
// OAuth Provider Enum
// — Add new providers by appending here, interface constraints take effect automatically
// ============================================================================

export const OAuthProviderType = {
  PASSWORD:  'password',   // Password authentication
  DINGTALK:  'dingtalk',   // DingTalk
  FEISHU:    'feishu',     // Feishu
  WECHAT:    'wechat',     // WeChat
} as const;

export const PlatformRole = {
  ADMIN:         'admin',
  TENANT_ADMIN:  'tenant_admin',
  MEMBER:        'member',
} as const;

export type PlatformRole = typeof PlatformRole[keyof typeof PlatformRole];

export type OAuthProviderType = typeof OAuthProviderType[keyof typeof OAuthProviderType];

// ============================================================================
// JWT Payload
// — Payload written when issuing access token, can be used directly after verification
// ============================================================================

/**
 * Access Token Payload
 * sub = userId, follows JWT standard
 */
export interface JwtAccessPayload {
  /** User ID */
  sub:        string;
  /** Tenant ID */
  tenantId:   string;
  /** User email */
  email:      string;
  /** User role (single role model) */
  role:       string;
  /** Permission list (optional, omitted to reduce token size, queried by server) */
  permissions?: string[];
  /** Login method */
  provider:   OAuthProviderType;
  /** Standard JWT fields */
  iat?: number;
  exp?: number;
}

/**
 * Refresh Token Payload (minimized, no business data)
 */
export interface JwtRefreshPayload {
  sub:       string;
  tenantId:  string;
  /** Refresh token unique ID, used for Redis blacklist comparison */
  jti:       string;
  iat?: number;
  exp?: number;
}

// ============================================================================
// Auth User Context
// — Guard attaches to request.user after verification, used by controller/router
// ============================================================================

export interface AuthUser {
  userId:      string;
  tenantId:    string;
  email:       string;
  role:        string;
  permissions: string[];
  provider:    OAuthProviderType;
}

// ============================================================================
// OAuth Provider Abstract Interface
// — DingTalk, Feishu, WeChat each implement this interface, core-auth doesn't depend on specific SDKs
// — Concrete implementations go in each BFF or agent-server
// ============================================================================

/** OAuth authorization code exchanged for token result */
export interface OAuthTokens {
  accessToken:   string;
  refreshToken?: string;
  expiresIn:     number;
  scope?:        string;
}

/** OAuth obtained user basic info (standardized structure across providers) */
export interface OAuthUserProfile {
  /** Provider side user unique ID */
  providerId:    string;
  provider:      OAuthProviderType;
  email?:        string;
  name:          string;
  avatar?:       string;
  /** Raw data returned by provider, used by upper layers as needed */
  raw:           Record<string, unknown>;
}

/**
 * OAuth Provider Unified Interface
 *
 * Implementation example (in bff/admin-bff/src/auth/dingtalk.provider.ts):
 * ```ts
 * export class DingtalkProvider implements OAuthProvider {
 *   readonly name = OAuthProviderType.DINGTALK;
 *   async exchangeCode(code, redirectUri) { ... }
 *   async getUserInfo(accessToken) { ... }
 * }
 * ```
 */
export interface OAuthProvider {
  readonly name: OAuthProviderType;

  /**
   * Exchange authorization code for OAuth access token
   * @param code    Authorization code from front-end callback
   * @param redirectUri  Redirect URI consistent with authorization request
   */
  exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens>;

  /**
   * Get user information using OAuth access token
   * Returns standardized OAuthUserProfile, masking provider API differences
   */
  getUserInfo(accessToken: string): Promise<OAuthUserProfile>;
}

// ============================================================================
// Token Pair
// — Returned to BFF after successful login, BFF returns to frontend
// ============================================================================

export interface AuthTokenPair {
  accessToken:   string;
  refreshToken:  string;
  /** Access token expiry (seconds) */
  expiresIn:     number;
  /** Refresh token expiry (seconds) */
  refreshExpiresIn: number;
}

// ============================================================================
// Permission Check Options
// ============================================================================

export interface PermissionCheckOptions {
  /** 'all' = AND, 'any' = OR, default 'any' */
  mode?: 'all' | 'any';
}
