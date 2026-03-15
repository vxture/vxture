/**
 * tenant.utils.ts - 租户解析工具函数
 * @package @vxture/core-tenant
 * @description
 *   提供租户 ID 解析和子域名提取等工具函数
 *
 * @author AI-Generated
 * @date 2026-03-15
 */

import { TenantResolveSource } from '../types/tenant.types';
import type { TenantInfo, TenantRequest, TenantResolveOptions } from '../types/tenant.types';

// ============================================================================
// 租户 ID 解析
// ============================================================================

/**
 * 从请求中按优先级解析租户 ID
 *
 * 优先级：
 * 1. x-tenant-id header
 * 2. 子域名（需提供 rootDomain）
 * 3. JWT payload 中的 tenantId（request.user.tenantId）
 * 4. fallbackTenantId（如设置）
 *
 * @throws 未能解析且未设置 fallbackTenantId 时抛出错误
 */
export function resolveTenantId(
  request: TenantRequest,
  options: TenantResolveOptions = {},
): TenantInfo {
  // 1. x-tenant-id header
  const headerValue = extractHeader(request.headers, 'x-tenant-id');
  if (headerValue) {
    return { id: headerValue, resolvedFrom: TenantResolveSource.HEADER };
  }

  // 2. 子域名
  if (options.rootDomain) {
    const host = extractHeader(request.headers, 'host') ?? '';
    const subdomain = extractSubdomain(host, options.rootDomain);
    if (subdomain) {
      return { id: subdomain, resolvedFrom: TenantResolveSource.SUBDOMAIN };
    }
  }

  // 3. JWT payload（JwtAuthGuard 已挂载 request.user）
  const jwtTenantId = request.user?.tenantId;
  if (jwtTenantId) {
    return { id: jwtTenantId, resolvedFrom: TenantResolveSource.JWT };
  }

  // 4. 回退
  if (options.fallbackTenantId) {
    return { id: options.fallbackTenantId, resolvedFrom: TenantResolveSource.FALLBACK };
  }

  throw new Error(
    '[core-tenant] Cannot resolve tenantId. Tried: ' +
    'x-tenant-id header, subdomain' +
    (options.rootDomain ? ` (rootDomain: ${options.rootDomain})` : '') +
    ', JWT payload. ' +
    'Set fallbackTenantId or ensure one source is present.',
  );
}

// ============================================================================
// 子域名提取
// ============================================================================

/**
 * 从 host 中提取子域名作为 tenantId
 *
 * @example
 * extractSubdomain('acme.vxture.com', 'vxture.com')  // → 'acme'
 * extractSubdomain('vxture.com', 'vxture.com')        // → undefined
 * extractSubdomain('www.vxture.com', 'vxture.com')    // → undefined（www 排除）
 */
export function extractSubdomain(host: string, rootDomain: string): string | undefined {
  // 去掉端口号
  const hostname = host.split(':').at(0) ?? host;

  if (!hostname.endsWith(`.${rootDomain}`)) return undefined;

  const subdomain = hostname.slice(0, -(rootDomain.length + 1));

  // 排除 www 和空字符串
  if (!subdomain || subdomain === 'www') return undefined;

  return subdomain;
}

// ============================================================================
// Redis / Cache key 前缀隔离
// ============================================================================

/**
 * 生成租户隔离的 key 前缀
 * 用于 Redis key、缓存 key 等需要按租户隔离的场景
 *
 * @example
 * tenantKey('acme', 'user:123')  // → 'tenant:acme:user:123'
 */
export function tenantKey(tenantId: string, key: string): string {
  return `tenant:${tenantId}:${key}`;
}

/**
 * 从租户隔离的 key 中提取原始 key
 *
 * @example
 * extractFromTenantKey('tenant:acme:user:123')  // → { tenantId: 'acme', key: 'user:123' }
 */
export function extractFromTenantKey(
  isolatedKey: string,
): { tenantId: string; key: string } | undefined {
  const match = /^tenant:([^:]+):(.+)$/.exec(isolatedKey);
  if (!match) return undefined;
  const [, tenantId, key] = match;
  if (!tenantId || !key) return undefined;
  return { tenantId, key };
}

// ============================================================================
// 内部工具
// ============================================================================

function extractHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}
