/**
 * index.ts - 公共导出入口
 * @package @vxture/core-tenant
 * @description
 *   核心租户模块统一导出
 */

// Types
export { TenantResolveSource } from "./types";
export type { TenantInfo, TenantRequest, TenantResolveOptions } from "./types";

// NestJS Module & Context Provider
export { TenantModule, TenantContext, TENANT_OPTIONS } from "./context";

// Middleware
export { TenantMiddleware } from "./middleware";

// Utils
export {
  resolveTenantId,
  extractSubdomain,
  tenantKey,
  extractFromTenantKey,
} from "./utils";
