/**
 * tenant.types.ts - 类型定义
 * @package @vxture/core-tenant
 * @description
 *   租户相关类型定义
 */

// ============================================================================
// 租户基础信息
// — 从请求解析出的租户标识，不含业务数据
// ============================================================================

/**
 * 租户基础信息
 * 由 TenantMiddleware 解析后挂载到 request.tenant
 */
export interface TenantInfo {
  /** 租户唯一 ID */
  id: string;
  /** 解析来源，用于调试和日志 */
  resolvedFrom: TenantResolveSource;
}

/**
 * 租户 ID 解析来源
 */
export const TenantResolveSource = {
  /** x-tenant-id header */
  HEADER:    'header',
  /** 子域名，如 acme.vxture.com */
  SUBDOMAIN: 'subdomain',
  /** JWT payload 中的 tenantId */
  JWT:       'jwt',
  /** 回退默认值 */
  FALLBACK:  'fallback',
} as const;

export type TenantResolveSource = typeof TenantResolveSource[keyof typeof TenantResolveSource];

// ============================================================================
// 请求扩展接口
// — 供 middleware 和 guard 使用，不依赖具体框架的 Request 类型
// ============================================================================

/**
 * 扩展了租户信息的请求接口
 * Express/NestJS req 满足此接口
 */
export interface TenantRequest {
  headers: Record<string, string | string[] | undefined>;
  /** middleware 解析后挂载，未解析时为 undefined */
  tenant?: TenantInfo;
  /** core-auth JwtAuthGuard 挂载的用户信息，含 tenantId */
  user?: { tenantId?: string; [key: string]: unknown };
}

// ============================================================================
// 解析选项
// ============================================================================

export interface TenantResolveOptions {
  /**
   * 平台根域名，用于从子域名提取 tenantId
   * 例如：'vxture.com' → 'acme.vxture.com' 解析出 'acme'
   */
  rootDomain?: string;

  /**
   * 解析失败时的回退 tenantId
   * 不设置时解析失败会抛出异常
   */
  fallbackTenantId?: string;
}
