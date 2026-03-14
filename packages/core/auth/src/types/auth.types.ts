/**
 * auth.types.ts - 服务端认证类型定义
 * @package @vxture/core-auth
 *
 * 只包含服务端 JWT、OAuth、权限相关类型。
 * 无任何浏览器 API（localStorage、sessionStorage 等）。
 */

// ============================================================================
// OAuth Provider 枚举
// — 新增 provider 只需在此追加，接口约束自动生效
// ============================================================================

export const OAuthProviderType = {
  PASSWORD:  'password',   // 账号密码
  DINGTALK:  'dingtalk',   // 钉钉
  FEISHU:    'feishu',     // 飞书
  WECHAT:    'wechat',     // 微信
} as const;

export type OAuthProviderType = typeof OAuthProviderType[keyof typeof OAuthProviderType];

// ============================================================================
// JWT Payload
// — 签发 access token 时写入的载荷，验证后可直接使用
// ============================================================================

/**
 * Access Token 载荷
 * sub = userId，符合 JWT 标准
 */
export interface JwtAccessPayload {
  /** 用户 ID */
  sub:        string;
  /** 租户 ID */
  tenantId:   string;
  /** 用户邮箱 */
  email:      string;
  /** 用户角色（单角色模型） */
  role:       string;
  /** 权限列表（可选，减少 token 体积时不写入，由服务端查询） */
  permissions?: string[];
  /** 登录方式 */
  provider:   OAuthProviderType;
  /** 标准 JWT 字段 */
  iat?: number;
  exp?: number;
}

/**
 * Refresh Token 载荷（最小化，不包含业务数据）
 */
export interface JwtRefreshPayload {
  sub:       string;
  tenantId:  string;
  /** refresh token 唯一 ID，用于 Redis 黑名单比对 */
  jti:       string;
  iat?: number;
  exp?: number;
}

// ============================================================================
// 认证用户上下文
// — Guard 验证通过后挂载到 request.user，供 controller/router 使用
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
// OAuth Provider 抽象接口
// — 钉钉、飞书、微信各自实现此接口，core-auth 不依赖具体 SDK
// — 具体实现放在各 BFF 或 agent-server 中
// ============================================================================

/** OAuth 授权码换取的 token 结果 */
export interface OAuthTokens {
  accessToken:   string;
  refreshToken?: string;
  expiresIn:     number;
  scope?:        string;
}

/** OAuth 获取到的用户基本信息（各 provider 标准化后的结构） */
export interface OAuthUserProfile {
  /** provider 侧的用户唯一 ID */
  providerId:    string;
  provider:      OAuthProviderType;
  email?:        string;
  name:          string;
  avatar?:       string;
  /** provider 返回的原始数据，供上层按需使用 */
  raw:           Record<string, unknown>;
}

/**
 * OAuth Provider 统一接口
 *
 * 实现示例（放在 bff/admin-bff/src/auth/dingtalk.provider.ts）：
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
   * 用授权码换取 OAuth access token
   * @param code    前端回调带来的授权码
   * @param redirectUri  与授权请求一致的回调地址
   */
  exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens>;

  /**
   * 用 OAuth access token 获取用户信息
   * 返回标准化的 OAuthUserProfile，屏蔽各 provider API 差异
   */
  getUserInfo(accessToken: string): Promise<OAuthUserProfile>;
}

// ============================================================================
// Token 对
// — 登录成功后返回给 BFF，BFF 再返回给前端
// ============================================================================

export interface AuthTokenPair {
  accessToken:   string;
  refreshToken:  string;
  /** access token 有效期（秒） */
  expiresIn:     number;
}

// ============================================================================
// 权限检查选项
// ============================================================================

export interface PermissionCheckOptions {
  /** 'all' = AND，'any' = OR，默认 'any' */
  mode?: 'all' | 'any';
}
